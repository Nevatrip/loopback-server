import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './nevatrip.datasource.json';

export class NevatripDataSource extends juggler.DataSource {
  static dataSourceName = 'nevatrip';

  constructor(
    @inject('datasources.config.nevatrip', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
