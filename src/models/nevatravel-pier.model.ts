import {Entity, model, property} from '@loopback/repository';

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
