import {Entity, model, property} from '@loopback/repository';
import {NevatravelTickets} from './nevatravel-order.model';

@model()
export class NevatravelCruise extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  cruise_date: string;

  @property({
    type: 'string',
    required: true,
  })
  starting_time: string;

  @property({
    type: 'string',
    required: true,
  })
  ending_time: string;

  @property({
    type: 'string',
    default: '00:00',
  })
  full_time?: string;

  @property({
    type: 'object',
    required: true,
  })
  program: {
    id: string;
    name: string;
  };

  @property({
    type: 'object',
  })
  ship?: {
    id: string;
    name: string;
  };

  @property({
    type: 'object',
  })
  pier_departure?: {
    id: string;
    name: string;
  };

  @property({
    type: 'object',
  })
  prices?: NevatravelTickets;

  @property({
    type: 'object',
  })
  back_prices?: NevatravelTickets;

  @property({
    type: 'string',
    default: '',
  })
  state?: string;

  @property({
    type: 'string',
    required: true,
    default: 'Есть',
  })
  available_seats: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  back_cruises?: BackCruis[];

  constructor(data?: Partial<NevatravelCruise>) {
    super(data);
  }
}

export interface BackCruis {
  id: string;
  uid: string;
  ship_id: string;
  program_id: string;
  cruise_date: string;
  starting_time: Date;
  ending_time: Date;
  pier_departure_id: string;
  pier_arrival_id: string;
  is_through: boolean;
  created_at: Date;
  updated_at: Date;
  is_visible: boolean;
  state: string;
  deleted_at?: Date | null;
  blocked: boolean;
  block_by_user_id: string;
  block_date?: Date | null;
  can_sell_e_ticket: boolean;
  block_reason?: string | null;
  cruise_version: number;
  initial_program_id: string;
  mins_to_send: number;
}
