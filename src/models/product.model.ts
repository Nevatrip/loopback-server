import {Entity, model, property} from '@loopback/repository';
import {Options as RRule} from 'rrule';

export interface Ticket {
  _key: string;
  price: number;
  name: string;
  category: {
    title: string;
  };
}

export interface Direction {
  _key: string;
  tickets: Ticket[];
  partner?: {
    email?: string;
  };
  partnerName?: string;
}

export interface DirectionComplex extends Direction {
  _type: 'complex';
  nested: Direction['_key'][];
  isEveryOwnDate?: boolean; // У каждого направления своя дата
}

export interface DirectionProduct extends Direction {
  start: string | number | Date;
  _type: 'direction' | 'complex';
  schedule: ProductEvent[];
  timeOffset: number;
  point: Object;
  dates?: Date[];
  datesOpenTime?: Date[];
  buyTimeOffset?: number;
}

export interface IAction extends ProductEvent {
  _id: string;
  _key: string;
  start: Date; // UTC
  timeOffset?: number; // timeOffset in minutes
  expired?: boolean;
}

interface i18nString {
  [lang: string]: {
    name: string;
  };
}

type byweekday = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su';

@model()
class ProductEvent extends Entity {
  _key: string;
  _type: 'event';
  title: string;
  start: Date;
  end: Date;
  startTimezone?: string;
  endTimezone?: string;
  rrule?: {
    freq: 'daily' | 'weekly';
    until?: Date;
    byweekday?: byweekday[];
  };
  allDay?: boolean;
  description?: string;
  actions: IAction[];
  tickets?: Ticket[];
  point?: Object;

  constructor(data?: Partial<ProductEvent>) {
    super(data);
  }
}

@model()
export class Product extends Entity {
  @property({type: 'string', id: true})
  _id: string;

  @property({description: "Tour's ID from old admin"})
  oldId?: number;

  @property({type: 'object', required: true})
  title: i18nString;

  @property({type: 'string', required: true})
  titleLong: string;

  @property({type: 'string'})
  description?: string;

  @property.array(String)
  status?: string[];

  @property({type: 'object'})
  image?: object;

  @property({type: 'object'})
  category?: object;

  @property({type: 'string', required: true})
  key: string;

  @property.array(Object, {required: true})
  // directions: (DirectionProduct | DirectionComplex)[];
  directions: DirectionProduct[];

  @property.array(String)
  features?: string[];

  @property({type: 'string'})
  descriptionPrepend?: string;

  @property({type: 'string'})
  descriptionAppend?: string;

  @property({type: 'string'})
  advice?: string;

  @property({type: 'object', required: true})
  point: object;

  @property({type: 'string'})
  priceDescription?: string;

  @property({type: 'string', required: true})
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

  @property({type: 'object', required: true})
  place: object;

  @property({type: 'object', required: true})
  partner: object;

  @property.array(ProductEvent)
  schedule?: ProductEvent[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export class SanityResponse extends Entity {
  @property({ id: true })
  query: string

  response: any

  constructor(data?: Partial<SanityResponse>) {
    super(data);
  }
}
