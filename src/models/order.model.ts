import {Entity, model, property} from '@loopback/repository';
import {CartProduct} from './cart-product.model';
import {BaseResponse, PaymentResponse} from 'cloudpayments';

@model({settings: {strict: false}})
export class Order extends Entity {
  @property({type: 'string'})
  sessionId: string;

  @property({type: 'object', required: true})
  user: {
    email: string;
    phone: string;
    fullname: string;
  };

  @property({type: 'string', id: true})
  id?: string;

  @property({type: 'string', default: 'new'})
  status?: string;

  @property({type: 'date'})
  created?: Date;

  @property({type: 'date'})
  updated?: Date;

  @property({type: 'string', default: 'default'})
  source?: string;

  @property({type: 'object'})
  payment?: PaymentResponse | BaseResponse;

  @property.array(CartProduct)
  products?: CartProduct[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
