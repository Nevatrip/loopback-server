import { model, property, belongsTo } from '@loopback/repository';
import { PaymentResponse } from 'cloudpayments';
import { Cart } from './cart.model';
import { User, UserWithRelations } from './user.model';

interface IFullDiscount {
  service: 'fullDiscount'
  request: {}
}

interface IYandexKassa {
  service: 'yandexkassa'
  request: {}
}

interface ICloudPayments {
  service: 'cloudpayments'
  request: PaymentResponse
}

type IPayment = ICloudPayments | IYandexKassa | IFullDiscount;

@model()
export class Order extends Cart {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: { dataType: 'ObjectID' },
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    default: 'new',
  })
  status: 'new' | 'paid' | 'rejected';

  @property({default: 'default'})
  source?: string;

  @property({type: 'object'})
  payment?: IPayment;

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
