import {format} from 'util';
import {readFileSync} from 'fs';

import {inject, lifeCycleObserver, LifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';

const {
  MONGO_USER: user = '',
  MONGO_PASS: password = '',
  MONGO_HOST: host = '127.0.0.1',
  MONGO_DB_ORDERS: database = 'orders',
  MONGO_URL: url,
  MONGO_REPLICA: replica,
  MONGO_SSLCA: SSLCA,
  MONGO_PORT: _port = '27017',
} = process.env;

const port = parseInt( _port, 10 );

const urlQuery = [];

if (replica) urlQuery.push( { key: 'replicaSet', value: replica } );
if (password) urlQuery.push( { key: 'authSource', value: database } );
if (SSLCA) urlQuery.push( { key: 'ssl', value: 'true' } );

const generateUrlQuery = urlQuery.map( item => `${ item.key }=${ item.value }` ).join( '&' );
const userPassword = user ? `${ user }:${ encodeURIComponent( password ) }@` : '';

const config = {
  name: 'order',
  connector: 'mongodb',
  // url: format(
  //   'mongodb://%s:%s@%s/%s?replicaSet=%s&authSource=%s&ssl=true',
  //   user,
  //   password,
  //   [ `${ host }:${ port }` ].join( ',' ),
  //   database,
  //   replica,
  //   database,
  // ),
  url: `mongodb://${ userPassword }${ [ `${ host }:${ port }` ].join( ',' ) }/${ database }?${ generateUrlQuery }`,
  host,
  port,
  user,
  password,
  database,
  sslCA: SSLCA ? readFileSync( SSLCA ) : '',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

console.log( `config`, config );

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class OrderDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'order';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.order', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
