import {Entity, model, property} from '@loopback/repository';
import { SanityEntity } from './sanity.model';

interface Event {
  start: Date;
  end: Date;
  allDay: boolean;
  startTimezone: string;
  endTimezone: string;
  point: any;
  tickets: any;
}

export interface IAction extends Event {
  expired: boolean;
  timeOffset: number;
}

interface Schedule extends Event {
  actions: IAction[];
}

interface Direction {
  _key: string;
  _type: 'complex' | 'direction';
  schedule: Schedule[];
  buyTimeOffset: number;

  dates?: Date[];
  datesOpenTime?: Date[];
}

@model({settings: {strict: false}})
export class Product extends SanityEntity {
  // Define well-known properties here

  directions: Direction[]
  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
