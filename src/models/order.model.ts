import {model, property} from '@loopback/repository';
import {
  BaseResponse,
  PaymentResponse,
  PaymentSuccessModel,
} from 'cloudpayments';
import {Cart} from './cart.model';

@model({settings: {strict: false}})
export class Order extends Cart {
  @property({id: true})
  id?: string;

  @property({default: 'new'})
  status: 'new' | 'paid' | 'rejected';

  @property({default: 'default'})
  source?: string;

  @property({type: 'object'})
  payment?: PaymentResponse | BaseResponse | {Model: PaymentSuccessModel};

  @property()
  sum?: number;

  @property()
  isFullDiscount?: string;

  @property({type: 'object'})
  ofd?: object;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
