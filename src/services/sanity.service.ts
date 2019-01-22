import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {SanityDataSource} from '../datasources/sanity.datasource';
import {Service} from '../models';

export interface SanityService {
  getServiceByAlias(alias: string): Promise<Service>;
}

export class SanityServiceProvider implements Provider<SanityService> {
  constructor(
    @inject('datasources.sanity')
    protected dataSource: juggler.DataSource = new SanityDataSource(),
  ) {}

  value(): Promise<SanityService> {
    return getService(this.dataSource);
  }
}
