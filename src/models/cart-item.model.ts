import {Entity, model, property} from '@loopback/repository';

@model()
export class CartItem extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  serviceId: string;

  @property({type: 'object'})
  options?: object;

  constructor(data?: Partial<CartItem>) {
    super(data);
  }
}
