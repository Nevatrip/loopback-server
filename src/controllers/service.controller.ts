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

  // @get('/schedule/:alias')
  // async getScheduleByAlias(@param.query.string('alias') alias: string) {
  //   return await this.sanityService.getScheduleByAlias(alias);
  // }
}
