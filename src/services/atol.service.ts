import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AtolDataSource} from '../datasources/';

export interface AtolService {
  getToken(
    login: string,
    pass: string,
  ): Promise<
    {
      token: string;
      error: null;
      timestamp: string;
    }[]
  >;
  postSell(
    token: string,
    groupCode: string,
    timestamp: string,
    externalId: string,
    service: object,
    receipt: object,
  ): Promise<object>;
  getReport(token: string, groupCode: string, orderId: string): Promise<object>;
}

export class AtolServiceProvider implements Provider<AtolService> {
  constructor(
    @inject('datasources.atol')
    protected dataSource: juggler.DataSource = new AtolDataSource(),
  ) {}

  value(): Promise<AtolService> {
    return getService(this.dataSource);
  }
}
