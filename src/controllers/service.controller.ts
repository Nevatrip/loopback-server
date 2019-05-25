import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import * as format from 'date-fns/format';
import {parse} from 'date-fns';

export class ServiceController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/service/{id}', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: 'Get Service data by Id',
  })
  async getServiceById(@param.path.string('id') id: string) {
    const service = (await this.sanityService.getServiceById(id))[0];

    return service;
  }

  @get('/service/{id}/cart', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: 'Get Service data for cart by Id',
  })
  async getServiceForCartById(@param.path.string('id') id: string) {
    const service = (await this.sanityService.getServiceForCartById(id))[0];

    return service;
  }

  @get('/service/{id}/dates', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: 'Get Service dates by Id',
  })
  async getDatesById(@param.path.string('id') id: string) {
    const services = await this.sanityService.getServiceById(id);
    let dir: {[key: string]: string[]} = {};
    (await services[0]).directions.forEach(direction => {
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
      }
      dir[direction._key] = [...new Set(dates)];
    });

    return dir;
  }

  @get('/service/{id}/schedule/{directionId}/{date}', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: "Get Service schedule by Id, direction's id and date",
  })
  async getScheduleById(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
  ) {
    const actualDate = parse(date, 'dd.MM.yyyy', new Date());
    const services = await this.sanityService.getServiceById(id);
    const direction = (await services[0]).directions.filter(
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
