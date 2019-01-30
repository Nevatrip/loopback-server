import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';

export class ServiceController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/service/{alias}')
  async getServiceByAlias(@param.path.string('alias') alias: string) {
    return await this.sanityService.getServiceByAlias(alias);
  }

  @get('/service/{alias}/dates')
  async getDatesByAlias(@param.path.string('alias') alias: string) {
    const service = await this.sanityService.getServiceByAlias(alias);

    return {
      ...service[0],
      periods: [
        {
          eventId: 11111111,
          start: 1548849600,
          end: 1551528000,
        },
        {
          eventId: 22222222,
          start: 1549022400,
          end: 1551528000,
        },
        {
          eventId: 33333333,
          start: 1546344000,
          end: 1553947200,
        },
      ],
      dates: [
        '02.02.2019',
        '03.02.2019',
        '05.02.2019',
        '06.02.2019',
        '12.02.2019',
        '14.02.2019',
        '17.02.2019',
        '18.02.2019',
        '19.02.2019',
        '22.02.2019',
        '23.02.2019',
        '24.02.2019',
        '28.02.2019',
        '01.03.2019',
        '02.03.2019',
        '14.03.2019',
      ],
    };
  }

  // @get('/schedule/:alias')
  // async getScheduleByAlias(@param.query.string('alias') alias: string) {
  //   return await this.sanityService.getScheduleByAlias(alias);
  // }
}
