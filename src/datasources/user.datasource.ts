import {format} from 'util';
import {readFileSync} from 'fs';

import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const {
  MONGO_USERS_USER: user = '',
  MONGO_USERS_PASS: password = '',
  MONGO_USERS_HOST: host = '127.0.0.1',
  MONGO_USERS_DB_NAME: database = 'user',
  MONGO_USERS_URL: url,
  MONGO_USERS_REPLICA: replica,
  MONGO_USERS_SSLCA: SSLCA,
  MONGO_USERS_PORT: _port = '27017',
} = process.env;

const port = parseInt( _port, 10 );

const config = {
  name: 'user',
  connector: 'mongodb',
  // url: format(
  //   'mongodb://%s:%s@%s/%s?replicaSet=%s&authSource=%s&ssl=true',
  //   user,
  //   password,
  //   [`${host}:${port}`].join(','),
  //   database,
  //   replica,
  //   database,
  // ),
  host,
  port,
  user,
  password,
  database,
  // sslCA: SSLCA ? readFileSync( SSLCA ) : '',
  useNewUrlParser: true
};

console.log( `mongodb`, config );

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class UserDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'user';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.user', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
