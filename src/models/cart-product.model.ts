import {Entity, model, property} from '@loopback/repository';

@model()
export class CartProduct extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  key: string;

  @property({
    type: 'string',
    required: true,
  })
  productId: string;

  @property({type: 'object'})
  options?: object;

  constructor(data?: Partial<CartProduct>) {
    super(data);
  }
}
