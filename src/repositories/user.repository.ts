import {DefaultCrudRepository, repository, HasManyRepositoryFactory, Filter } from '@loopback/repository';
import { User, UserRelations, Order } from '../models';
import { UserDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { OrderRepository } from './order.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.user') dataSource: UserDataSource,
    @repository.getter( 'OrderRepository' ) getOrderRepository: Getter<OrderRepository>,
  ) {
    super(User, dataSource);

    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      getOrderRepository
    )

    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
  }

  async findOrCreate( filter: Filter<User>, data: User ): Promise<User> {
    const user = await this.findOne( filter );

    if ( !user ) {
      return await this.create( data );
    }

    return user;
  }
}
