import {Model, model, property} from '@loopback/repository';
import { User } from '.';

@model()
export class OrderRequest extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  cart: string;

  @property({
    type: User,
    required: true,
  })
  user: User;

  constructor(data?: Partial<OrderRequest>) {
    super(data);
  }
}

export interface OrderRequestRelations {
  // describe navigational properties here
}

export type OrderRequestWithRelations = OrderRequest & OrderRequestRelations;
