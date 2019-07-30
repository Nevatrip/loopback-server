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
import {inject} from '@loopback/core';
import {SanityService} from '../services/sanity.service';
import {Order, Cart, Product} from '../models';
import {/* sendEmail, */ getPaymentDescription} from '../utils';
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
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(CartRepository)
    public cartRepository: CartRepository,
    @inject('services.SanityService')
    protected sanityService: SanityService,
  ) {}

  async getCart(cart: Cart) {
    const {sessionId} = cart;
    const order = await this.cartRepository.get(sessionId);

    if (order == null || !order.products.length) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${sessionId}`,
      );
    }

    order.user = cart.user;

    return order;
  }

  async getPayment(order: Order) {
    if (!privateKey || !publicId) {
      throw new HttpErrors.Unauthorized(`Payment gateway is not defined`);
    }

    if (!order.sum && !order.isFullDiscount) {
      throw new HttpErrors.PaymentRequired(`Ошибка суммы`);
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

    const payment = await clientApi.createOrder({
      Amount: order.sum || 0,
      Currency: 'RUB',
      // JsonData?: string;
      Description: getPaymentDescription(order.products.length),
      email: order.user.email,
      phone: order.user.phone,
    });

    if (!payment.isSuccess()) {
      throw new HttpErrors.NotFound(`Платёж не прошёл…`);
    }

    return payment.getResponse();
  }

  async getSum(order: Order) {
    let sum = 0;
    const products: {[key: string]: Product} = {};

    for (const productItem of order.products) {
      const {productId, tickets, direction} = productItem;

      const product =
        products[productId] ||
        (await this.sanityService.getProductForCartById(productId))[0];
      productItem.product = product;
      const directionData = product.directions.find(
        dir =>
          dir._type === 'direction' &&
          direction &&
          direction.some(item => item._key === dir._key),
      );

      if (!directionData) return;

      for (const ticket of directionData.tickets) {
        if (tickets && tickets.hasOwnProperty(ticket._key)) {
          sum += ticket.price * tickets[ticket._key];
        }
      }
    }

    return sum;
  }

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
  async create(@requestBody() cart: Cart): Promise<Order> {
    const order = (await this.getCart(cart)) as Order;
    order.sum = await this.getSum(order);
    order.payment = await this.getPayment(order);

    const newOrder = await this.orderRepository.create(order);

    // sendEmail(newOrder, 'new');

    return newOrder;
  }

  @post('/orders/check', {
    responses: {'200': {description: 'Check CloudPayment'}},
  })
  async check(
    @requestBody({
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              InvoiceId: {type: 'number'},
            },
          },
        },
      },
    })
    body: PaymentSuccessModel,
  ) {
    const filter: Filter<Order> = {
      where: {
        'payment.Model.Number': body.InvoiceId,
      } as Where<Order>,
    };
    const order = await this.orderRepository.findOne(filter);

    if (!order) return {code: 10};

    return {code: 0};
  }

  @post('/orders/pay', {
    responses: {
      '200': {
        description: 'pay CloudPayment',
      },
    },
  })
  async pay(
    @requestBody({
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              InvoiceId: {type: 'number'},
            },
          },
        },
      },
    })
    body: PaymentSuccessModel,
  ) {
    const filter: Filter<Order> = {
      where: {
        'payment.Model.Number': body.InvoiceId,
      } as Where<Order>,
    };
    const order = await this.orderRepository.findOne(filter);

    if (!order) return {code: 10};

    order.status = 'paid';
    order.updated = new Date();

    await this.orderRepository.updateById(order.id, order);

    // sendEmail(order, 'paid');
    // sendEmail(order, 'manager');

    return {code: 0};
  }

  @post('/orders/fail', {
    responses: {
      '200': {
        description: 'fail CloudPayment',
      },
    },
  })
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
