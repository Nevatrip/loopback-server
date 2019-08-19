import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {NevatripDataSource} from '../datasources/nevatrip.datasource';

export interface NevatripService {
  getSale(id: number, code: string): Promise<number[]>;
}

export class NevatripServiceProvider implements Provider<NevatripService> {
  constructor(
    @inject('datasources.nevatrip')
    protected dataSource: juggler.DataSource = new NevatripDataSource(),
  ) {}

  value(): Promise<NevatripService> {
    return getService(this.dataSource);
  }
}
