import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {parse} from 'date-fns';
import {convertToTimeZone} from 'date-fns-timezone';
import {Product, DirectionProduct, IAction} from '../models';

export class ProductController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/product/{id}', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data by Id',
  })
  async getProductById(@param.path.string('id') id: string): Promise<Product> {
    const product = (await this.sanityService.getProductById(id))[0];

    return product;
  }

  @get('/product/{id}/cart', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data for cart by Id',
  })
  async getProductForCartById(@param.path.string('id') id: string) {
    const product = (await this.sanityService.getProductForCartById(id))[0];

    product.directions.forEach(direction => {
      if (direction._type === 'direction') {
        let dates: number[] = [];
        direction.schedule.forEach(event => {
          const timeZone = event.startTimezone || 'Europe/Moscow';
          const offsetDate: Date = convertToTimeZone(new Date(), {timeZone});
          offsetDate.setMinutes(
            offsetDate.getMinutes() + (direction.buyTimeOffset || 0),
          );

          event.actions.forEach(action => {
            const actionDate = convertToTimeZone(action.start, {timeZone});
            if (actionDate > offsetDate) {
              dates.push(actionDate.getTime() / 1000);
            }
          });
        });
        delete direction.schedule;
        direction.dates = [...new Set(dates)].sort();
      }
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
    const product = (await this.sanityService.getProductById(id))[0];

    const directions: {[key: string]: DirectionProduct} = {};
    product.directions.forEach(item => {
      if (item._type === 'direction') directions[item._key] = item;
    });

    if (!directions.hasOwnProperty(directionId)) return;
    const direction = directions[directionId];
    if (!direction.schedule || !direction.schedule.length) return;

    let schedule: IAction[] = [];
    direction.schedule.forEach(event => {
      const timeZone = event.startTimezone || 'Europe/Moscow';
      const offsetDate: Date = convertToTimeZone(new Date(), {timeZone});
      offsetDate.setMinutes(
        offsetDate.getMinutes() + (direction.buyTimeOffset || 0),
      );
      const actualDate = convertToTimeZone(
        parse(date, 'yyyy-MM-dd', offsetDate),
        {timeZone},
      );

      event.actions.forEach(action => {
        const actionDate = convertToTimeZone(action.start, {timeZone});
        if (
          actionDate > offsetDate &&
          actionDate.toDateString() === actualDate.toDateString()
        ) {
          schedule.push(action);
        }
      });
    });

    return schedule;
  }
}
