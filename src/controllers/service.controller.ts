import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {Service} from '../models';
import * as format from 'date-fns/format';
import {parse} from 'date-fns';

export class ServiceController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/service/{alias}/alias', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: 'Get Service data by alias',
  })
  async getServiceByAlias(@param.path.string('alias') alias: string) {
    return await this.sanityService.getServiceByAlias(alias);
  }

  @get('/service/{id}', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: 'Get Service data by Id',
  })
  async getServiceById(@param.path.string('id') id: string) {
    return await this.sanityService.getServiceById(id);
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

  @get('/service/{id}/schedule/{directionId}/{date}/{event}', {
    responses: {
      '200': {
        description: 'Service Response',
      },
    },
    summary: "Get Service schedule by Id, direction's id and date",
  })
  async getPlaces(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
    @param.path.string('event') event: string,
  ) {
    const actualDate = parse(date, 'dd.MM.yyyy', new Date());

    return {
      event,
      date: actualDate.toDateString(),
      place: `test-place-id`,
      places: [
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
        'a7',
        'a8',
        'a9',
        'a10',
        'a11',
        'a12',
        'a13',
        'a14',
        'a15',
        'a16',
        'a17',
        'a18',
        'a19',
        'a20',
        'a21',
        'a22',
        'a23',
        'a24',
        'a25',
        'a26',
        'a27',
        'a28',
        'a29',
        'a30',
        'a31',
        'a32',
        'a33',
        'a34',
        'a35',
        'a36',
        'a37',
        'a38',
        'a39',
        'a40',
        'a41',
        'a42',
        'a43',
        'a44',
        'a45',
        'a46',
        'a47',
        'a48',
        'a49',
        'a50',
        'a51',
        'a52',
        'a53',
        'a54',
        'a55',
        'a56',
        'a57',
        'a58',
        'a59',
        'a60',
        'a61',
        'a62',
        'a63',
        'a64',
        'a65',
        'a66',
        'a67',
        'a68',
        'a69',
        'a70',
      ].map(place => ({
        id: place,
        category: Math.random() >= 0.3 ? 'standart' : 'vip',
        value: Math.random() >= 0.5 ? 2 : 1,
        available: !!(Math.random() >= 0.5),
      })),
    };
  }

  // @get('/schedule/:alias')
  // async getScheduleByAlias(@param.query.string('alias') alias: string) {
  //   return await this.sanityService.getScheduleByAlias(alias);
  // }
}
