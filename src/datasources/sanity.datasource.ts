import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './sanity.datasource.json';

export class SanityDataSource extends juggler.DataSource {
  static dataSourceName = 'sanity';

  constructor(
    @inject('datasources.config.sanity', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
