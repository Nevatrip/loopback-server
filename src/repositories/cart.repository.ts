import {DefaultKeyValueRepository} from '@loopback/repository';
import {Cart} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CartRepository extends DefaultKeyValueRepository<
  Cart
 > {
  constructor(
    @inject('datasources.redis') dataSource: RedisDataSource,
  ) {
    super(Cart, dataSource);
  }
}
