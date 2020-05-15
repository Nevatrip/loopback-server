import { DefaultKeyValueRepository } from '@loopback/repository';
import { SanityResponse } from '../models';
import { CacheDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class SanityRepository extends DefaultKeyValueRepository<
  SanityResponse
> {
  constructor(
    @inject('datasources.cache') dataSource: CacheDataSource,
  ) {
    super(SanityResponse, dataSource);
  }
}
