import {Entity, model, property} from '@loopback/repository';
import {IAction} from './product.model';
const generate = require('nanoid/generate');

@model()
export class CartDirection extends Entity {
  @property({
    type: 'string',
  })
  _key: string;

  @property({
    type: 'string',
    default: () => generate('0123456789', 6),
  })
  number?: string;

  @property({item: 'object'})
  action: IAction;

  constructor(data?: Partial<CartDirection>) {
    super(data);
  }
}
