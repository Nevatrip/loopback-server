import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as JSONConfig from './mongo.datasource.json';

const config = { ...JSONConfig };

config.host = process.env.MONGO_HOST || JSONConfig.host;

export class MongoDataSource extends juggler.DataSource {
  static dataSourceName = 'mongo';

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
