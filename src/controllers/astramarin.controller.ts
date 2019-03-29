import {inject} from '@loopback/core';
import {
  get,
  // post,
  // put,
  // del,
  // param,
  // requestBody,
  // HttpErrors,
} from '@loopback/rest';
import {AstramarinService} from '../services/astramarin.service';

export class AstramarinController {
  constructor(
    @inject('services.AstramarinService')
    protected astramarinService: AstramarinService,
  ) {}

  @get('/partner/astramarin/serviceGroups', {
    responses: {
      '200': {
        description: `Return service groups`,
      },
    },
    summary: `Get services groups`,
  })
  async getServiceGroups(): Promise<any> {
    const response = await this.astramarinService.getServiceGroups();

    return JSON.parse(response.result.return.ServiceType.StringJSON);
  }
}
