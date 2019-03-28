import {Entity, model, property} from '@loopback/repository';

@model()
export class NevatravelProgram extends Entity {
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
  name: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_nightly: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_regular: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_for_foreigners: boolean;

  @property({
    type: 'string',
    default: null,
  })
  tour_type?: string;

  @property({
    type: 'string',
    default: '',
  })
  description?: string;

  @property({
    type: 'string',
    default: '',
  })
  pier_arrival_id?: string;

  @property({
    type: 'string',
    default: '',
  })
  pier_departure_id?: string;

  @property({
    type: 'date',
    required: true,
  })
  created_at: Date;

  @property({
    type: 'date',
    required: true,
  })
  updated_at: Date;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  full_time: number;

  @property({
    type: 'object',
    default: null,
  })
  settings?: object;

  @property({
    type: 'object',
  })
  ships?: {
    group_ids: string[];
    ship_ids: string[];
  };

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  is_active: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    default: [''],
  })
  reverse_program_ids?: string[];

  @property({
    type: 'array',
    itemType: 'number',
  })
  tabs?: number[];

  @property({
    type: 'object',
  })
  prices?: object;

  @property({
    type: 'string',
  })
  label?: string;

  @property({
    type: 'date',
    default: null,
  })
  deleted_at?: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  other_piers?: boolean;

  @property({
    type: 'string',
    default: '',
  })
  comment?: string;

  @property({
    type: 'number',
  })
  blocked_tickets?: number;

  @property({
    type: 'number',
    default: 0,
  })
  open_time_percentage?: number;

  @property({
    type: 'date',
    default: null,
  })
  open_time_starting?: Date;

  @property({
    type: 'date',
    default: null,
  })
  open_time_ending?: Date;

  @property({
    type: 'number',
  })
  open_time_limit?: number;

  @property({
    type: 'number',
    default: null,
  })
  tickets_for_attendant?: number;

  constructor(data?: Partial<NevatravelProgram>) {
    super(data);
  }
}
