import { Entity, model, property, belongsTo } from '@loopback/repository';
import { customAlphabet } from 'nanoid';
import { User, UserWithRelations, Product, IAction } from '.';

@model()
export class CartProductOptions extends Entity {
  @property({
    description: 'Boarding Ticket Number',
    default: () => customAlphabet( '0123456789', 6 ),
  })
  number?: string;

  @property()
  direction: string;

  @property()
  tickets: {
    [ticketKey: string]: number
  };

  @property()
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

  @property.array( CartProductOptions )
  options?: CartProductOptions[];

  @property( Product )
  product?: Product;

  constructor(data?: Partial<CartProduct>) {
    super(data);
  }
}

@model()
export class Cart extends Entity {
  @property({
    id: true,
    generated: false,
    example: 'test-test-test',
  })
  id?: string;

  @property({default: () => new Date()})
  created: Date;

  @property()
  updated?: Date;

  @property.array( CartProduct )
  products: CartProduct[];

  @property()
  promocode?: string;

  @property()
  lang?: string;

  @belongsTo( () => User )
  userId?: string;

  constructor(data?: Partial<Cart>) {
    super(data);
  }
}

export interface CartRelations {
  // describe navigational properties here
  user?: UserWithRelations;
}

export type CartWithRelations = Cart & CartRelations;
