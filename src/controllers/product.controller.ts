import { get, param, HttpErrors, del } from '@loopback/rest'
import {parse, format} from 'date-fns'
import {findTimeZone, getUTCOffset} from 'timezone-support'

import { SanityController } from './sanity.controller'
import { Product, IAction } from '../models'

const TIMEZONE = process.env.TIMEZONE;
if (!TIMEZONE) throw new Error('TIMEZONE (env) is not defined');

type Dates = {
  [key: string]: {}[]
};

const sortDates = (dates: Dates): Date[] => {
  return Object.keys(dates)
    .map(date => new Date(date))
    .sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });
};

export class ProductController extends SanityController {

  async getProduct(
    @param.path.string( 'id' ) id: string,
    @param.query.string( 'lang' ) lang: string = 'en'
  ) {
    const query = `*[_id=="${ id }"]{
      _id,
      oldId,
      title,
      'key': title.${ lang }.key.current,
      'directions': directions[]{
        _key,
        _type,
        title,
        nested,
        isEveryOwnDate,
        buyTimeOffset,
        'point': point->{
          'coords': coords{lat,lng},
          description,
          'key': key.current,
          'title': title.${ lang }
        },
        'schedule': schedule[]{
          ...,
          'point': point->{
            'coords': coords{lat,lng},
            'description': description.${ lang },
            'key': key.current,
            'title': title.${ lang }
          },
          'ticket': ticket[]->
        },
        'tickets': tickets[]{
          ...,
          'category': category->{
            'name': name.current
            ,title
          },
          'ticket': ticket[]->{
            'name': name.current,
            title
          }
        }
      }
    }`.replace(/\n|\s/gm,'');

    const [ product ] = await this.sanityProxy( query, 'true', 1000 * 60 ) as Product[];

    return product;
  }

  @get( '/product/{id}/cart', {
    responses: { '200': { description: 'Proxy Sanity' } },
    summary: 'Get data from Sanity',
  } )
  async getProductForCart(
    @param.path.string( 'id' ) id: string,
    @param.query.string( 'lang' ) lang: string = 'en'
  ) {
    if ( !TIMEZONE ) throw new HttpErrors.NotFound( 'TIMEZONE (env) is not defined' );

    const product = await this.getProduct( id, lang );

    product.directions?.forEach( direction => {
      const {
        _type,
        schedule = [],
        buyTimeOffset = 0
      } = direction;

      if ( _type === 'complex' ) return;

      const dates: Dates = {};
      const datesOpenTime: Dates = {};

      schedule.forEach( event => {
        const buyTime = new Date();
        buyTime.setMinutes( buyTime.getMinutes() + buyTimeOffset );

        const timeZone = findTimeZone( event.startTimezone || TIMEZONE );

        event.actions.forEach( action => {
          const actionDate = new Date(action.start);

          if (actionDate > buyTime) {
            const timeOffset = getUTCOffset(actionDate, timeZone).offset;

            actionDate.setMinutes(actionDate.getMinutes() + actionDate.getTimezoneOffset() - timeOffset );
            const dateKey = format(actionDate, 'yyyy-MM-dd');

            if (event.allDay) {
              datesOpenTime[dateKey] = datesOpenTime[dateKey] || [];
            } else {
              dates[dateKey] = dates[dateKey] || [];
            }
          }
        } )
      } )

      delete direction.schedule;
      direction.dates = sortDates( dates );
      direction.datesOpenTime = sortDates( datesOpenTime );
    } )

    return product;
  }

  @get( '/product/{id}/schedule/{directionId}/{date}', {
    responses: { '200': { description: 'Product Response' } },
    summary: 'Get Product schedule by Id, direction\'s id and date',
  } )
  async getProductSchedule(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
    @param.query.string('lang') lang: string = 'en',
  ) {
    if ( !TIMEZONE ) throw new HttpErrors.NotFound( 'TIMEZONE (env) is not defined' );

    const product = await this.getProduct( id, lang );

    const direction = product.directions.find( ( { _key } ) => _key === directionId );
    if ( !direction ) throw new HttpErrors.NotFound(`Direction "${ directionId }" is not found.`);

    const { schedule = [], buyTimeOffset = 0 } = direction;

    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const scheduleArray: IAction[] = [];

    schedule.forEach( ( { actions = [], end, ...event } ) => {
      const timeZone = findTimeZone( event.startTimezone || TIMEZONE );

      actions.forEach( action => {
        const buyTime = new Date();
        buyTime.setMinutes( buyTime.getMinutes() + buyTimeOffset );
        const actionDate = new Date( action.start );
        const isExpired = actionDate <= buyTime;
        const timeOffset = getUTCOffset( actionDate, timeZone ).offset;
        actionDate.setMinutes( actionDate.getMinutes() + actionDate.getTimezoneOffset() - timeOffset );

        if ( actionDate.toDateString() === parsedDate.toDateString() ) {
          action.timeOffset = timeOffset;
          action.expired = isExpired;

          scheduleArray.push( {
            ...action,
            end,
          } );
        }
      });
    });

    return scheduleArray;
  }
}
