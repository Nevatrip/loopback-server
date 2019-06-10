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
} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {
  ClientService,
  TaxationSystem,
  VAT,
  ResponseCodes,
  ReceiptTypes,
  PayNotification,
} from 'cloudpayments';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
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
  async create(
    @requestBody() order: Order,
  ): Promise<
    | {
        request: PayNotification;
        response: {
          code: ResponseCodes;
        };
      }
    | {
        request: PayNotification;
        response: {
          code?: undefined;
        };
      }
  > {
    const client = new ClientService({
      privateKey: 'pk_9571506275254507c34463787fa0b',
      publicId: 'bcf206edd471f415bf49881b3ad167fb',
      org: {
        taxationSystem: TaxationSystem.SIMPLIFIED_INCOME,
        inn: 7802873242,
      },
    });

    const handlers = client.getNotificationHandlers();
    const receiptApi = client.getReceiptApi();

    const response = await handlers.handlePayRequest(
      {payload: 'new'},
      async request => {
        console.log('request', request);

        // Проверям запрос, например на совпадение цены заказа
        if (request.Amount > 0) {
          return ResponseCodes.INVALID_AMOUNT;
        }

        // Отправляем запрос на создание чека
        const responseReceipt = await receiptApi.createReceipt(
          {
            Type: ReceiptTypes.Income,
          },
          {
            Items: [
              {
                label: 'Наименование товара или сервиса',
                quantity: 2,
                price: 1200,
                amount: 2400,
                vat: VAT.VAT18,
                ean13: '1234456363',
              },
            ],
          },
        );

        console.log('responseReceipt', responseReceipt);

        // Проверяем, что запрос встал в очередь,
        // иначе обрабатываем исключение

        // Если все прошло успешно, возвращаем 0
        return ResponseCodes.SUCCESS;
      },
    );

    await this.orderRepository.create(order);

    return response;
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
