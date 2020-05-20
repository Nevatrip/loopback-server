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
  constructor(
    @inject('datasources.user') dataSource: UserDataSource,
  ) {
    super(User, dataSource);
  }
}
