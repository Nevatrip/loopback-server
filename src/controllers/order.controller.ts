import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Order} from '../models';
import {sendEmail} from '../utils';
import {OrderRepository, CartRepository} from '../repositories';
import {
  ClientService,
  TaxationSystem,
  PaymentSuccessModel,
} from 'cloudpayments';

const privateKey = process.env.CLOUDPAYMENTS_PRIVATEKEY;
const publicId = process.env.CLOUDPAYMENTS_PUBLICID;

export class OrderController {
  constructor(
    @repository(OrderRepository) public orderRepository: OrderRepository,
    @repository(CartRepository) public cartRepository: CartRepository,
  ) {}

  @post('/orders', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {schema: {'x-ts-type': Order}},
        },
      },
    },
  })
  async create(@requestBody() order: Order): Promise<Order> {
    if (!privateKey || !publicId) {
      throw new HttpErrors.Unauthorized(`Payment gateway is not defined`);
    }

    const {sessionId} = order;
    const cart = await this.cartRepository.get(sessionId);

    if (cart == null || !cart.products.length) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${sessionId}`,
      );
    }

    const client = new ClientService({
      privateKey: privateKey,
      publicId: publicId,
      org: {
        taxationSystem: TaxationSystem.SIMPLIFIED_INCOME,
        inn: 7802873242,
      },
    });

    const clientApi = client.getClientApi();

    const orderPayment = await clientApi.createOrder({
      Amount: cart.products.length,
      Currency: 'RUB',
      // JsonData?: string;
      Description: `Покупка ${
        cart.products.length < 2
          ? 'экскурсии'
          : cart.products.length + ' экскурсий'
      } на сайте NevaTrip`,
      email: order.user.email,
      phone: order.user.phone,
    });

    if (!orderPayment.isSuccess()) {
      throw new HttpErrors.NotFound(`Платёж не прошёл…`);
    }

    order.payment = orderPayment.getResponse();
    order.status = 'new';
    order.created = new Date();
    order.source = 'default';
    order.products = cart.products;

    const newOrder = await this.orderRepository.create(order);

    sendEmail(newOrder);

    return newOrder;
  }

  @post('/orders/check', {
    responses: {'200': {description: 'Check CloudPayment'}},
  })
  async check(
    @requestBody({
      content: {'application/x-www-form-urlencoded': {}},
    })
    body: PaymentSuccessModel,
  ) {
    console.log('CCCCHCKCKKCKCKC', body.TransactionId);
    const filter: Filter<Order> = {
      where: {
        'payment.Model.Number': body.TransactionId,
        // tslint:disable-next-line: no-any
      } as any,
    };
    const order: Order | null = await this.orderRepository.findOne(filter);
    console.log('@@@##@@!!!@@');

    if (!order) return {code: 0};

    return {code: 0};
  }

  @post('/orders/pay', {
    responses: {
      '200': {
        description: 'pay CloudPayment',
      },
    },
  })
  // tslint:disable-next-line: no-any
  async pay(@requestBody() body: {}) {
    console.log('pay CloudPayment', body);
    return body;
  }

  @post('/orders/fail', {
    responses: {
      '200': {
        description: 'fail CloudPayment',
      },
    },
  })
  // tslint:disable-next-line: no-any
  async fail(@requestBody() body: {}) {
    console.log('fail CloudPayment', body);
    return body;
  }

  @get('/orders/count', {
    responses: {
      '200': {
        description: 'Order model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Order))
    where?: Where<Order>,
  ): Promise<Count> {
    return await this.orderRepository.count(where);
  }

  @get('/orders', {
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Order}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Order))
    filter?: Filter<Order>,
  ): Promise<Order[]> {
    return await this.orderRepository.find(filter);
  }

  @patch('/orders', {
    responses: {
      '200': {
        description: 'Order PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() order: Order,
    @param.query.object('where', getWhereSchemaFor(Order))
    where?: Where<Order>,
  ): Promise<Count> {
    return await this.orderRepository.updateAll(order, where);
  }

  @get('/orders/{id}', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {schema: {'x-ts-type': Order}},
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Order> {
    return await this.orderRepository.findById(id);
  }

  @patch('/orders/{id}', {
    responses: {
      '204': {
        description: 'Order PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  @put('/orders/{id}', {
    responses: {
      '204': {
        description: 'Order PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}', {
    responses: {
      '204': {
        description: 'Order DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
