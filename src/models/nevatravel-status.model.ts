import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class NevatravelStatus extends Entity {
  @property({
    type: 'string',
    default: 'forbidden',
  })
  status: 'forbidden' | 'available';

  @property({
    type: 'string',
  })
  version?: string;

  constructor(data?: Partial<NevatravelStatus>) {
    super(data);
  }
}
