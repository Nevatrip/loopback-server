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
  schedule: IEvent[];
  dates?: number[];
}

export interface IAction {
  _key: string;
  start: Date;
}

export interface IEvent {
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
}

@model()
export class Product extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  _id: string;

  @property({
    type: 'object',
    required: true,
  })
  title: {
    [key: string]: {
      name: string;
    };
  };

  @property({
    type: 'string',
    required: true,
  })
  titleLong: string;

  @property({type: 'string'})
  description?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  status?: string[];

  @property({type: 'object'})
  image?: object;

  @property({type: 'object'})
  category?: object;

  @property({
    type: 'array',
    itemType: 'object',
  })
  tags?: object[];

  @property({
    type: 'string',
    required: true,
  })
  key: string;

  @property({
    type: 'array',
    itemType: 'object',
    required: true,
  })
  directions: (DirectionProduct | DirectionComplex)[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  features?: string[];

  @property({type: 'string'})
  descriptionPrepend?: string;

  @property({type: 'string'})
  descriptionAppend?: string;

  @property({type: 'string'})
  advice?: string;

  @property({
    type: 'object',
    required: true,
  })
  point: object;

  @property({type: 'string'})
  priceDescription?: string;

  @property({
    type: 'string',
    required: true,
  })
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

  @property({
    type: 'object',
    required: true,
  })
  place: object;

  @property({
    type: 'object',
    required: true,
  })
  partner: object;

  @property({
    type: 'array',
    itemType: 'object',
  })
  schedule?: IEvent[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
