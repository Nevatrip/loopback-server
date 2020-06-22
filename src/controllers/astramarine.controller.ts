import { inject } from '@loopback/core';
import { AstramarineService } from '../services';
import { param, get } from '@loopback/rest';

const email = process.env.PARTNER_ASTRAMARINE_EMAIL;

export class AstramarineController {
  constructor(
    @inject( 'services.Astramarine' )
    protected astramarineService: AstramarineService,
  ) {}

  @get( '/partner/astramarine/services', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  } )
  async getServices(
    @param.query.string( 'dateFrom' ) dateFrom?: string,
    @param.query.string( 'dateTo' ) dateTo?: string,
  ): Promise<any> {
    const StringJSON = JSON.stringify({
      email,
    });

    const response = await this.astramarineService.getServices( { StringJSON } );

    return response;
  }
}
