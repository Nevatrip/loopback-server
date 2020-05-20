import { model, property } from '@loopback/repository';
import { PaymentResponse } from 'cloudpayments';
import { Cart } from './cart.model';

interface IYandexKassa {
  type: 'yandexkassa'
  response: {}
}

interface ICloudPayments {
  type: 'cloudpayments'
  response: PaymentResponse
}

type IPayment = ICloudPayments | IYandexKassa;

@model()
export class Order extends Cart {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  status: 'new' | 'paid' | 'rejected';

  @property({default: 'default'})
  source?: string;

  @property({type: 'object'})
  payment: IPayment

  @property({type: 'object'})
  reporting?: object; // ОФД

  @property()
  hash?: string; // email's hash

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
