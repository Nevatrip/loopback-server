import { Entity, model, property, hasMany, hasOne, embedsOne } from '@loopback/repository';
import { Order, Cart } from '.';
import { CartWithRelations } from './cart.model';
import { OrderWithRelations } from './order.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    // mongodb: { dataType: 'ObjectID' },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  fullName: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'number',
    required: true,
  })
  phone: number;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  @hasOne( () => Cart )
  cart?: Cart;

  @hasMany( () => Order )
  orders?: Order[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  cart?: CartWithRelations;
  orders?: OrderWithRelations;
}

export type UserWithRelations = User & UserRelations;
