import {inject} from '@loopback/core';
import {get, param, HttpErrors} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {parse, format} from 'date-fns';
import {findTimeZone, getUTCOffset} from 'timezone-support';
import {Product, IAction} from '../models';

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

export class ProductController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/sanity', {
    responses: {'200': {description: 'Proxy Sanity'}},
    summary: 'Get data from Sanity',
  })
  async proxySanity(
    @param.query.string('query') query: string,
  ): Promise<Object> {
    return await this.sanityService.proxySanity(query);
  }

  @get('/product/{id}', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data by Id',
  })
  async getProductById(@param.path.string('id') id: string): Promise<Product> {
    const [product] = await this.sanityService.getProductById(id);

    return product;
  }

  @get('/product/{id}/cart', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data for cart by Id',
  })
  async getProductForCartById(
    @param.path.string('id') id: string,
    @param.query.string('lang') lang: string = 'ru',
  ) {
    if (!TIMEZONE) throw new HttpErrors.NotFound('TIMEZONE (env) is not defined');

    const [product]: Product[] = await this.sanityService.getProductForCartById(id, lang);

    (product.directions || []).forEach(direction => {
      if (direction._type !== 'direction') return;
      if (!direction.schedule || !direction.schedule.length) return;

      const {
        buyTimeOffset = 0,
        schedule,
      } = direction;
      let dates: Dates = {};
      let datesOpenTime: Dates = {};

      schedule.forEach(event => {
        const buyTime = new Date();
        buyTime.setMinutes( buyTime.getMinutes() + buyTimeOffset );

        const timeZone = findTimeZone(event.startTimezone || TIMEZONE);

        event.actions.forEach(action => {
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
        });
      });

      delete direction.schedule;
      direction.dates = sortDates(dates);
      direction.datesOpenTime = sortDates(datesOpenTime);
    });

    return product;
  }

  @get('/product/{id}/schedule/{directionId}/{date}', {
    responses: {'200': {description: 'Product Response'}},
    summary: "Get Product schedule by Id, direction's id and date",
  })
  async getScheduleById(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
    @param.query.string('lang') lang: string = 'en',
  ): Promise<IAction[]> {
    if (!TIMEZONE) throw new HttpErrors.NotFound('TIMEZONE (env) is not defined');
    const [product]: Product[] = await this.sanityService.getProductForCartById(id, lang);

    const direction = product.directions.find(({ _key }) => _key === directionId);
    if (!direction) throw new HttpErrors.NotFound(`Direction with directionId ${ directionId } is not found.`);

    const { schedule, buyTimeOffset = 0 } = direction;
    if (!schedule || !schedule.length) throw new HttpErrors.NotFound(`Schedule in directionId ${ directionId } is not found.`);

    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

    let scheduleArray: IAction[] = [];
    schedule.forEach(event => {
      const timeZone = findTimeZone(event.startTimezone || TIMEZONE);

      event.actions.forEach(action => {
        const buyTime = new Date();
        buyTime.setMinutes(buyTime.getMinutes() + buyTimeOffset);
        const actionDate = new Date(action.start);
        const isExpired = actionDate <= buyTime;
        const timeOffset = getUTCOffset(actionDate, timeZone).offset;
        actionDate.setMinutes(actionDate.getMinutes() + actionDate.getTimezoneOffset() - timeOffset);

        if ( actionDate.toDateString() === parsedDate.toDateString() ) {
          action.timeOffset = timeOffset;
          action.allDay = event.allDay;
          action.tickets = event.tickets;
          action.point = event.point;
          action.expired = isExpired;
          scheduleArray.push(action);
        }
      });
    });

    return scheduleArray;
  }
}
