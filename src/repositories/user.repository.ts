import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import { User, UserRelations, Order } from '../models';
import { UserDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { OrderRepository } from './order.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public orders: HasManyRepositoryFactory<Order, typeof User.prototype.id>

  constructor(
    @inject('datasources.user') dataSource: UserDataSource,
    @repository(OrderRepository) protected orderRepository: OrderRepository
  ) {
    super(User, dataSource);

    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      async () => orderRepository
    )
  }
}
