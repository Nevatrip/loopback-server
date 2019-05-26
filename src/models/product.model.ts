import {Entity, model, property} from '@loopback/repository';

@model()
export class Product extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  titleLong: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  status?: string[];

  @property({
    type: 'object',
  })
  image?: object;

  @property({
    type: 'object',
  })
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
  directions: {
    _key: string;
    _type: 'direction';
    schedule?: {
      _key: string;
      _type: 'event';
      start: Date;
      actions: {
        _key: string;
        start: Date;
      }[];
    }[];
    dates?: string[];
    scheduleOnDate?: {}[];
  }[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  features?: string[];

  @property({
    type: 'string',
  })
  descriptionPrepend?: string;

  @property({
    type: 'string',
  })
  descriptionAppend?: string;

  @property({
    type: 'string',
  })
  advice?: string;

  @property({
    type: 'object',
    required: true,
  })
  point: object;

  @property({
    type: 'string',
  })
  priceDescription?: string;

  @property({
    type: 'string',
    required: true,
  })
  price: string;

  @property({
    type: 'string',
  })
  priceWidget?: string;

  @property({
    type: 'string',
  })
  priceAlt?: string;

  @property({
    type: 'string',
  })
  sale?: string;

  @property({
    type: 'string',
  })
  routeMap?: string;

  @property({
    type: 'date',
  })
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
  schedule?: object[];

  @property({
    type: 'string',
    required: true,
    default: 'test',
  })
  test: string;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
