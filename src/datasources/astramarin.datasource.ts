import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './astramarin.datasource.json';
const tokenGenerator = require('basic-auth-token');

const secureConfig: DSConfig = Object.assign({}, config);

const envToken = process.env.ASTRAMARIN;
const envUser = process.env.ASTRAMARIN_USERNAME;
const envPass = process.env.ASTRAMARIN_PASSWORD;

if (
  envUser &&
  envPass &&
  secureConfig.security &&
  secureConfig.security.scheme === 'BasicAuth'
) {
  secureConfig.security.username = envUser;
  secureConfig.security.password = envPass;
}

if (envToken || (envUser && envPass)) {
  const token = envToken || tokenGenerator(envUser, envPass);
  secureConfig.wsdl_headers = secureConfig.wsdl_headers || {};
  secureConfig.wsdl_headers.Authorization = `Basic ${token}`;
}

console.log('secureConfig', secureConfig);

export class AstramarinDataSource extends juggler.DataSource {
  static dataSourceName = 'astramarin';

  constructor(
    @inject('datasources.config.astramarin', {optional: true})
    dsConfig: object = secureConfig,
  ) {
    dsConfig = Object.assign({}, dsConfig, {
      connector: require('loopback-connector-soap'),
    });
    super(dsConfig);
  }
}

interface WsdlHeaders {
  [headerName: string]: string;
}

interface Security {
  scheme: string;
  username: string;
  password: string;
}

interface Operation {
  service: string;
  port: string;
  operation: string;
}

interface Operations {
  [operationName: string]: Operation;
}

interface DSConfig {
  name: string;
  connector: string;
  url: string;
  wsdl: string;
  wsdl_headers?: WsdlHeaders;
  remotingEnabled?: boolean;
  security?: Security;
  operations?: Operations;
}
