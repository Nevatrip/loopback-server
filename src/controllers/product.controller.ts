import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
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
      let dates: number[] = [];
      if (direction.schedule) {
        direction.schedule.forEach(event => {
          event.actions.forEach(action => {
            const date = new Date(action.start);

            // return only feature dates
            if (date > new Date()) {
              dates.push(date.getTime() / 1000);
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
    const actualDate = parse(date, 'yyyy-MM-dd', new Date());
    const product = (await this.sanityService.getProductById(id))[0];

    const directions: {[key: string]: any} = {};
    product.directions.forEach(direction => {
      directions[direction._key] = direction;
    });

    const direction = directions[directionId];

    let schedule: {}[] = [];
    (direction.schedule || []).length &&
      direction.schedule.forEach(
        (event: {
          isAllDay?: any;
          actions?: any;
          startLabel?: any;
          endLabel?: any;
          start?: any;
          end?: any;
        }) => {
          !event.isAllDay &&
            event.actions.forEach(
              (action: {
                start: string | number | Date;
                end: string | number | Date;
              }) => {
                const actionDate = new Date(action.start);
                if (
                  actionDate > new Date() &&
                  actionDate.toDateString() === actualDate.toDateString()
                ) {
                  event.startLabel = action.start;
                  event.endLabel = action.end;
                  event.start = new Date(action.start).getTime() / 1000;
                  event.end = new Date(action.end).getTime() / 1000;
                  delete event.actions;
                  schedule.push(event);
                }
              },
            );
        },
      );

    return schedule;
  }
}
