import {format} from 'util';
import {readFileSync} from 'fs';

import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT
  ? parseInt(process.env.MONGO_PORT, 10)
  : 27018;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoReplica = process.env.MONGO_REPLICA;
const mongoSSLCA = process.env.MONGO_SSLCA;

const config = {
  name: 'mongo',
  connector: 'mongodb',
  // url: format(
  //   'mongodb://%s:%s@%s/%s?replicaSet=%s&authSource=%s&ssl=true',
  //   mongoUser,
  //   mongoPass,
  //   [`${mongoHost}:${mongoPort}`].join(','),
  //   mongoDBName,
  //   mongoReplica,
  //   mongoDBName,
  // ),
  sslCA: mongoSSLCA ? readFileSync(mongoSSLCA) : '',
  host: mongoHost,
  port: mongoPort,
  user: mongoUser,
  password: mongoPass,
  database: mongoDBName,
  useNewUrlParser: true,
};

console.log('config', config);

export class MongoDataSource extends juggler.DataSource {
  static dataSourceName = 'mongo';

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
