import {Entity, model, property} from '@loopback/repository';
import {CartProduct} from './cart-product.model';

@model({
  excludeBaseProperties: ['created', 'lastUpdated'],
})
export class Cart extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    example: 'test-test-test',
  })
  sessionId: string;

  @property({type: 'date'})
  created?: Date;

  @property({type: 'date'})
  lastUpdated?: Date;

  @property.array(CartProduct)
  products?: CartProduct[];

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}
