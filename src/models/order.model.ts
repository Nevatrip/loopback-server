import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    default: 'new',
  })
  status: string;

  @property({
    type: 'date',
    required: true,
  })
  created: string;

  @property({
    type: 'date',
  })
  updated?: string;

  @property({
    type: 'string',
    default: 'default',
  })
  source?: string;

  @property({
    type: 'object',
    required: true,
  })
  payment: object;

  @property({
    type: 'object',
    required: true,
  })
  cart: object;

  @property({
    type: 'object',
    required: true,
  })
  user: object;

  // Indexer property to allow additional data
  // [prop: string]: any;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
