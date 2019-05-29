import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import * as format from 'date-fns/format';
import {parse} from 'date-fns';

export class ProductController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/product/{id}', {
    responses: {
      '200': {
        description: 'Product Response',
      },
    },
    summary: 'Get Product data by Id',
  })
  async getProductById(@param.path.string('id') id: string) {
    const product = (await this.sanityService.getProductById(id))[0];

    return product;
  }

  @get('/product/{id}/cart', {
    responses: {
      '200': {
        description: 'Product Response',
      },
    },
    summary: 'Get Product data for cart by Id',
  })
  async getProductForCartById(@param.path.string('id') id: string) {
    const product = (await this.sanityService.getProductForCartById(id))[0];

    product.directions.forEach(direction => {
      let dates: string[] = [];
      if (direction.schedule) {
        direction.schedule.forEach(event => {
          event.actions.forEach(action => {
            const date = new Date(action.start);

            // return only feature dates
            if (date > new Date()) {
              dates.push(format(date, 'dd.MM.yyyy'));
            }
          });
        });
        delete direction.schedule;
        direction.dates = [...new Set(dates)];
      }
    });

    return product;
  }

  @get('/product/{id}/schedule/{directionId}/{date}', {
    responses: {
      '200': {
        description: 'Product Response',
      },
    },
    summary: "Get Product schedule by Id, direction's id and date",
  })
  async getScheduleById(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
  ) {
    const actualDate = parse(date, 'dd.MM.yyyy', new Date());
    const product = await this.sanityService.getProductById(id);
    const direction = (await product[0]).directions.filter(
      dir => dir._key === directionId,
    )[0];

    let schedule: {}[] = [];
    if (direction.schedule) {
      direction.schedule.forEach(event => {
        event.actions.forEach(action => {
          const actionDate = new Date(action.start);
          if (
            actionDate > new Date() &&
            actionDate.toDateString() === actualDate.toDateString()
          ) {
            event.start = action.start;
            delete event.actions;
            schedule.push(event);
          }
        });
      });
    }

    return schedule;
  }
}
