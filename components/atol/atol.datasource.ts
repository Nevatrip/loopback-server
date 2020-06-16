import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './atol.datasource.json';

export class AtolDataSource extends juggler.DataSource {
  static dataSourceName = 'atol';

  constructor(
    @inject('datasources.config.atol', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
