import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const {
  PARTNER_ASTRAMARINE_USERNAME: username,
  PARTNER_ASTRAMARINE_PASSWORD: password,
  PARTNER_ASTRAMARINE_URL: url,
} = process.env;

if ( !username || !password ) {
  throw new Error('ASTARMARINE username and/or password is not defined');
}

const config = {
  name: 'astramarine',
  connector: 'soap',
  url,
  wsdl: `${ url }?wsdl`,
  remotingEnabled: false,
  security: {
    scheme: "BasicAuth",
    username,
    password,
  },
  operations: {
    getServicesOnDate: {
      service: "InternetSaleJSON",
      port: "InternetSaleJSONSoap",
      operation: "ServicesOnDate"
    },
  }
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AstramarineDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'astramarine';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.astramarine', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
