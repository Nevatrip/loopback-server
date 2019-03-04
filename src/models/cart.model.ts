import {Entity, model, property} from '@loopback/repository';
import {CartItem} from './cart-item.model';

@model({
  excludeBaseProperties: ['created', 'lastUpdated'],
})
export class Cart extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  sessionId: string;

  @property({type: 'date'})
  created?: Date;

  @property({type: 'date'})
  lastUpdated?: Date;

  @property.array(CartItem)
  items?: CartItem[];

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}
