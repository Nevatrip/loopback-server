import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const {
  REDIS_HOST: host = '127.0.0.1',
  REDIS_PORT: port = 6379,
  REDIS_PASSWORD: password = 'password',
  REDIS_URL: url,
  REDIS_DB: db = 2,
} = process.env;

const config = {
  name: 'cart',
  connector: 'kv-redis',
  // url,
  host,
  port,
  password,
  db,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class CartDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'cart';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.cart', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
