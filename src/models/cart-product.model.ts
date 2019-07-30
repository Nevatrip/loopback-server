import {Entity, model, property} from '@loopback/repository';
import {Product, CartDirection} from './index';

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

  @property(Product)
  product?: Product;

  @property({type: 'object'})
  tickets?: {
    [key: string]: number;
  };

  @property.array(CartDirection)
  direction?: CartDirection[];

  constructor(data?: Partial<CartProduct>) {
    super(data);
  }
}
