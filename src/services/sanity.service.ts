import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { SanityDataSource } from '../datasources';
import { SanityResponse } from '../models';

export interface SanityService {
  proxySanity(query: string, CDNDomain?: string): Promise<SanityResponse[]>;
}

export class SanityProvider implements Provider<SanityService> {
  constructor(
    // sanity must match the name property in the datasource json file
    @inject('datasources.sanity')
    protected dataSource: SanityDataSource = new SanityDataSource(),
  ) {}

  value(): Promise<SanityService> {
    return getService(this.dataSource);
  }
}
