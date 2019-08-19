import {Entity, model, property} from '@loopback/repository';

export interface Ticket {
  _key: string;
  price: number;
  name: string;
}

export interface Direction {
  _key: string;
  tickets: Ticket[];
}

export interface DirectionComplex extends Direction {
  _type: 'complex';
  nested: Direction['_key'][];
  isEveryOwnDate?: boolean; // У каждого направления своя дата
}

export interface DirectionProduct extends Direction {
  _type: 'direction';
  schedule: ProductEvent[];
  dates?: number[];
  buyTimeOffset?: number;
}

export interface IAction {
  _key: string;
  start: Date;
}

interface i18nString {
  [key: string]: {
    name: string;
  };
  }

@model()
class ProductEvent extends Entity {
  _key: string;
  _type: 'event';
  title: string;
  start: Date;
  end: Date;
  startTimezone?: string;
  endTimezone?: string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceID?: string;
  isAllDay?: boolean;
  description?: string;
  actions: IAction[];

  constructor(data?: Partial<ProductEvent>) {
    super(data);
  }
}

@model()
export class Product extends Entity {
  @property({ type: 'string', id: true })
  _id: string;

  @property({ type: 'object', required: true })
  title: i18nString;

  @property({ type: 'string', required: true })
  titleLong: string;

  @property({type: 'string'})
  description?: string;

  @property.array(String)
  status?: string[];

  @property({type: 'object'})
  image?: object;

  @property({type: 'object'})
  category?: object;

  @property({ type: 'string', required: true })
  key: string;

  @property.array(Object, { required: true })
  directions: (DirectionProduct | DirectionComplex)[];

  @property.array(String)
  features?: string[];

  @property({type: 'string'})
  descriptionPrepend?: string;

  @property({type: 'string'})
  descriptionAppend?: string;

  @property({type: 'string'})
  advice?: string;

  @property({ type: 'object', required: true })
  point: object;

  @property({type: 'string'})
  priceDescription?: string;

  @property({ type: 'string', required: true })
  price: string;

  @property({type: 'string'})
  priceWidget?: string;

  @property({type: 'string'})
  priceAlt?: string;

  @property({type: 'string'})
  sale?: string;

  @property({type: 'string'})
  routeMap?: string;

  @property({type: 'date'})
  end?: string;

  @property({ type: 'object', required: true })
  place: object;

  @property({ type: 'object', required: true })
  partner: object;

  @property.array(ProductEvent)
  schedule?: ProductEvent[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
