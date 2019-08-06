import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {SanityDataSource} from '../datasources/sanity.datasource';
import {Product} from '../models';

export interface SanityService {
  getProductByAlias(alias: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product[]>;
  getProductForCartById(id: string): Promise<Product[]>;
}

export class SanityServiceProvider implements Provider<SanityService> {
  constructor(
    @inject('datasources.sanity')
    protected dataSource: juggler.DataSource = new SanityDataSource(),
  ) {}

  value(): Promise<SanityService> {
    return getService(this.dataSource);
  }
}