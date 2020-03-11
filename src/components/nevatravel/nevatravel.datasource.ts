import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './nevatravel.datasource.json';

export class NevatravelDataSource extends juggler.DataSource {
  static dataSourceName = 'nevatravel';

  constructor(
    @inject('datasources.config.nevatravel', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
