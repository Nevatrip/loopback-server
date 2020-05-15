import {Entity, model, property, hasMany} from '@loopback/repository';

@model({settings: {strict: false}})
export class SanityEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  _type?: string;

  @property({
    type: 'string',
  })
  _rev?: string;

  @property({
    type: 'date',
  })
  _createdAt?: string;

  @property({
    type: 'date',
  })
  _updatedAt?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<SanityEntity>) {
    super(data);
  }
}

export interface SanityEntityRelations {
  // describe navigational properties here
}

export type SanityEntityWithRelations = SanityEntity & SanityEntityRelations;

@model()
export class SanityResponse extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  query: string;

  @property({
    type: 'number',
  })
  ms?: number;

  @hasMany( () => SanityEntity )
  result: SanityEntity[];

  constructor(data?: Partial<SanityResponse>) {
    super(data);
  }
}
