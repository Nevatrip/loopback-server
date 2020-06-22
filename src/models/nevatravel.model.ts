import {Entity, model, property} from '@loopback/repository';

@model()
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

@model()
export class NevatravelPier extends Entity {
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
  uid: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  short_name: string;

  @property({
    type: 'string',
    default: '',
  })
  description?: string;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  is_active: boolean;

  @property({
    type: 'number',
  })
  label?: number;

  @property({
    type: 'object',
  })
  filters?: {
    blue: string;
    green: string;
    red: string;
    yellow: string;
  };

  @property({
    type: 'string',
    default: '',
  })
  parent_id?: string;

  @property({
    type: 'date',
    default: null,
  })
  deleted_at?: string;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
    default: '',
  })
  regbox_image_logo_id?: string;

  @property({
    type: 'string',
    default: '',
  })
  regbox_image_pier_logo_id?: string;

  @property({
    type: 'string',
    default: '',
  })
  regbox_image_background_id?: string;

  constructor(data?: Partial<NevatravelPier>) {
    super(data);
  }
}

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

  @property.array(String)
  reverse_program_ids?: string[];

  @property.array(Number)
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

@model()
export class NevatravelCruiseBack extends Entity {
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

  constructor(data?: Partial<NevatravelCruiseBack>) {
    super(data);
  }
}

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

  @property.apply(NevatravelCruiseBack)
  back_cruises?: NevatravelCruiseBack[];

  constructor(data?: Partial<NevatravelCruise>) {
    super(data);
  }
}

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
