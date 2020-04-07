import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as JSONconfig from './redis.datasource.config.json';

const config = { ...JSONconfig };

config.host = process.env.REDIS_HOST || JSONconfig.host;
config.password = process.env.REDIS_PASSWORD || JSONconfig.password;

export class RedisDataSource extends juggler.DataSource {
  static dataSourceName = 'redis';

  constructor(
    @inject('datasources.config.redis', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
