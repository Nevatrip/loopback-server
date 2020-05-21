import {DefaultKeyValueRepository, juggler} from '@loopback/repository';
import {SanityResponse} from '../models';
import {RedisDataSource} from '../datasources';
import { inject } from '@loopback/core';

export class SanityRepository extends DefaultKeyValueRepository<
  SanityResponse
> {
  constructor(
    @inject('datasources.redis') dataSource: RedisDataSource,
  ) {
    super(SanityResponse, dataSource);
  }
}
