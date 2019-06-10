import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Order} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  constructor(
    // @inject('datasources.mongo') dataSource: MongoDataSource,
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(Order, datasource);
  }
}
