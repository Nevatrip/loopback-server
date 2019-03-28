import {Entity, model, property} from '@loopback/repository';

@model()
export class NevatravelOrder extends Entity {
  @property({
    type: 'object',
    required: true,
  })
  tickets: NevatravelTickets;

  /** Fixed time */
  @property({
    type: 'number',
    id: true,
  })
  tour?: number;

  @property({
    type: 'number',
    id: true,
  })
  tourBack?: number;
  /** /Fixed time */

  /** Open time */
  @property({
    type: 'string',
  })
  date: string;

  @property({
    type: 'number',
    id: true,
  })
  point?: number;

  @property({
    type: 'number',
    id: true,
  })
  service: number;

  @property({
    type: 'number',
    id: true,
  })
  serviceBack: number;
  /** /Open time */

  constructor(data?: Partial<NevatravelOrder>) {
    super(data);
  }
}

export interface NevatravelTickets {
  full: number;
  half: number;
  children: number;
  attendant: number;
}
