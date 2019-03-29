import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AstramarinDataSource} from '../datasources';

export interface AstramarinService {
  getServiceGroups(): Promise<any>;
}

export class AstramarinServiceProvider implements Provider<AstramarinService> {
  constructor(
    @inject('datasources.astramarin')
    protected dataSource: juggler.DataSource = new AstramarinDataSource(),
  ) {}

  value(): Promise<AstramarinService> {
    return getService(this.dataSource);
  }
}
