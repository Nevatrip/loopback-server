import {inject} from '@loopback/core';
import {get, param, post, requestBody} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {parse, format} from 'date-fns';
import {findTimeZone, getUTCOffset} from 'timezone-support';
import {Product, DirectionProduct, IAction} from '../models';

type Dates = {
  [key: string]: Date[];
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
  async getProductForCartById(@param.path.string('id') id: string) {
    const [product] = await this.sanityService.getProductForCartById(id);

    product.directions.forEach(direction => {
      if (direction._type !== 'direction') return;

      const {
        buyTimeOffset = 0,
        schedule: [{timeZone = 'Europe/Moscow', start}],
      } = direction;
      let dates: Dates = {};
      let datesOpenTime: Dates = {};

      // Смещение часового пояса в минутах для каждого направления
      direction.timeOffset = getUTCOffset(
        new Date(start),
        findTimeZone(timeZone),
      ).offset;

      direction.schedule.forEach(event => {
        const offsetDate = new Date();
        offsetDate.setMinutes(offsetDate.getMinutes() + buyTimeOffset);

        event.actions.forEach(action => {
          const actionDate = new Date(action.start);
          if (actionDate > offsetDate) {
            actionDate.setMinutes(
              actionDate.getMinutes() - direction.timeOffset,
            );
            const dateKey = format(actionDate, 'yyyy-MM-dd');

            if (event.allDay) {
              datesOpenTime[dateKey] = datesOpenTime[dateKey] || [];
              datesOpenTime[dateKey].push(actionDate);
            } else {
              dates[dateKey] = dates[dateKey] || [];
              dates[dateKey].push(actionDate);
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
  ) {
    const [product] = await this.sanityService.getProductForCartById(id);

    const directions: {[key: string]: DirectionProduct} = {};
    product.directions.forEach(item => {
      if (item._type === 'direction') directions[item._key] = item;
    });

    if (!directions.hasOwnProperty(directionId)) return;
    const {schedule, buyTimeOffset = 0} = directions[directionId];
    if (!schedule || !schedule.length) return;

    let scheduleArray: IAction[] = [];
    schedule.forEach(event => {
      const offsetDate: Date = new Date();
      offsetDate.setMinutes(offsetDate.getMinutes() + buyTimeOffset);
      const actualDate = parse(date, 'yyyy-MM-dd', offsetDate);

      const timeZone = findTimeZone(event.timeZone || 'Europe/Moscow');
      const timeOffset = getUTCOffset(new Date(event.start), timeZone).offset;

      event.actions.forEach(action => {
        const actionDate = new Date(action.start);
        actionDate.setMinutes(actionDate.getMinutes() - timeOffset);

        if (
          actionDate > offsetDate &&
          actionDate.toDateString() === actualDate.toDateString()
        ) {
          action.allDay = event.allDay;
          action.tickets = event.tickets;
          action.point = event.point;
          scheduleArray.push(action);
        }
      });
    });

    return scheduleArray;
  }
}
