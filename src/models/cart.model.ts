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

  @property({type: 'date', default: () => new Date()})
  created: Date;

  @property({type: 'date'})
  updated?: Date;

  @property.array(CartProduct)
  products: CartProduct[];

  @property({type: 'object'})
  user: {
    email: string;
    phone: string;
    fullName: string;
  };

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}
