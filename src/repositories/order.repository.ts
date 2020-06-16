import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { Order, OrderRelations, User } from '../models';
import { UserDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { UserRepository } from './user.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly user: BelongsToAccessor<
    User,
    typeof Order.prototype.id
  >;

  constructor(
    @inject('datasources.user') dataSource: UserDataSource,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>
  ) {
    super(Order, dataSource);

    this.user = this.createBelongsToAccessorFor(
      'user',
      userRepositoryGetter
    )

    this.registerInclusionResolver('user', this.user.inclusionResolver)
  }
}
