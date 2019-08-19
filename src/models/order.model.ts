import {model, property} from '@loopback/repository';
import {
  BaseResponse,
  PaymentResponse,
  PaymentSuccessModel,
} from 'cloudpayments';
import {Cart} from './cart.model';

@model({settings: {strict: false}})
export class Order extends Cart {
  @property({type: 'string', id: true})
  id?: string;

  @property({
    type: 'string',
    default: 'new',
  })
  status: 'new' | 'paid' | 'rejected';

  @property({
    type: 'string',
    default: 'default',
  })
  source?: string;

  @property({type: 'object'})
  payment?: PaymentResponse | BaseResponse | {Model: PaymentSuccessModel};

  @property({type: 'number'})
  sum?: number;

  @property({type: 'string'})
  isFullDiscount?: string;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
