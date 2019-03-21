import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {Service} from '../models';
import * as format from 'date-fns/format';

export class ServiceController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/service/{alias}/alias')
  async getServiceByAlias(@param.path.string('alias') alias: string) {
    return await this.sanityService.getServiceByAlias(alias);
  }

  @get('/service/{id}')
  async getServiceById(@param.path.string('id') id: string) {
    return await this.sanityService.getServiceById(id);
  }

  @get('/service/{id}/dates')
  async getDatesById(@param.path.string('id') id: string) {
    const services: Promise<
      Service
    >[] = await this.sanityService.getServiceById(id);
    let dir: {[key: string]: string[]} = {};
    (await services[0]).directions.forEach(direction => {
      let dates: string[] = [];
      if (direction.schedule) {
        direction.schedule.forEach(event => {
          event.actions.forEach(action => {
            const date = new Date(action.start);
            if (date > new Date()) {
              dates.push(format(date, 'DD.MM.YYYY'));
            }
          });
        });
      }
      dir[direction._key] = [...new Set(dates)];
    });

    return dir;
  }

  @get('/service/{id}/schedule/{directionId}/{date}')
  async getScheduleById(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
  ) {
    const parts = date.split('.');
    const actualDate = new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10),
    );
    const services: Promise<
      Service
    >[] = await this.sanityService.getServiceById(id);
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

  // @get('/schedule/:alias')
  // async getScheduleByAlias(@param.query.string('alias') alias: string) {
  //   return await this.sanityService.getScheduleByAlias(alias);
  // }
}
