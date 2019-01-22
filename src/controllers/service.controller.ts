import {inject} from '@loopback/core';
import {get, param, HttpErrors} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';

export class ServiceController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  @get('/service')
  async getServiceByAlias(@param.query.string('alias') alias: string) {
    return await this.sanityService.getServiceByAlias(alias);
  }
}
