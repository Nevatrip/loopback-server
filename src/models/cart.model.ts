import {Entity, model, property} from '@loopback/repository';
import {Product, IAction} from './index';
const generate = require('nanoid/generate');

@model()
export class CartProductOptions extends Entity {
  @property({
    description: 'Boarding Ticket Number',
    default: () => generate('0123456789', 6),
  })
  number?: string;

  @property({description: "Direction's ID"})
  direction: {
    _key: string,
    title: {
      [lang: string]: string
    }
  };

  @property({type: 'object'})
  tickets: {
    [ticketKey: string]: number;
  };

  @property({item: 'object'})
  event: IAction;

  constructor(data?: Partial<CartProductOptions>) {
    super(data);
  }
}

@model()
export class CartProduct extends Entity {
  @property({
    id: true,
    description: 'Unique key of product',
  })
  key: string;

  @property({required: true})
  productId: string;

  @property(Product)
  product: Product;

  @property.array(CartProductOptions)
  options: CartProductOptions[];

  constructor(data?: Partial<CartProduct>) {
    super(data);
  }
}

@model()
export class Cart extends Entity {
  @property({
    id: true,
    required: true,
    example: 'test-test-test',
  })
  sessionId: string;

  @property({default: () => new Date()})
  created: Date;

  @property()
  updated?: Date;

  @property.array(CartProduct)
  products: CartProduct[];

  @property()
  promocode?: string;

  @property()
  lang?: string;

  @property()
  user: {
    email: string;
    phone: string;
    fullName: string;
  };

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}
