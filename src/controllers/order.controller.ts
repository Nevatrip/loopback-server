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
  RestBindings,
  Response,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { SanityService } from '../services';
import { Order, Cart, Product } from '../models';
import { sendEmail, getPaymentDescription } from '../utils';
import { OrderRepository, CartRepository } from '../repositories';
import {
  ClientService,
  TaxationSystem,
  PaymentSuccessModel,
} from 'cloudpayments';
import { format as _format } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as Excel from 'exceljs';
import * as renderEmail from '../utils/renderEmail';
import { createHmac } from 'crypto';
import { AtolService } from '../components/atol/atol.service';
import { NevatripService } from '../components/nevatrip/nevatrip.service';

const privateKey = process.env.CLOUDPAYMENTS_PRIVATEKEY;
const publicId = process.env.CLOUDPAYMENTS_PUBLICID;
const secret = process.env.SECRET;
const ATOLLOGIN = process.env.ATOL_LOGIN;
const ATOLTOKEN = process.env.ATOL_TOKEN;
const ATOLGROUP = process.env.ATOL_GROUP;

if (!secret) {
  throw new Error('SECRET (env) is not defined');
}

const getHash = (string: string) => {
  const sha1 = createHmac('sha1', secret);
  return sha1.update(string).digest('hex');
};

const checkHash = (string: string, hash: string): void => {
  const emailHash = getHash(string);

  if (emailHash !== hash) {
    throw new HttpErrors.Unauthorized(`Hash is invalid`);
  }
};

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(CartRepository)
    public cartRepository: CartRepository,
    @inject('services.SanityService')
    protected sanityService: SanityService,
    // @inject('services.NevatripService')
    // protected nevatripService: NevatripService,
    // @inject('services.AtolService')
    // protected atolService: AtolService,
    @inject(RestBindings.Http.RESPONSE)
    public res: Response,
  ) { }

  async getCart(cart: Cart) {
    const { sessionId } = cart;
    const order = await this.cartRepository.get(sessionId);

    if (order == null || !order.products.length) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${sessionId}`,
      );
    }

    order.user = cart.user;

    return order;
  }

  async getSum(order: Order, sendToAtol?: boolean) {
    let sum = 0;
    let sale = 0;
    let atolItems = [];
    const products: { [key: string]: Product } = {};

    for (const productItem of order.products) {
      const { productId, options } = productItem;

      if (
        !options ||
        !options[0] ||
        !options[0].direction ||
        !options[0].tickets
      )
        return;

      const [{ direction, tickets }] = options;

      const product =
        products[productId] ||
        (await this.sanityService.getProductForOrderById(productId))[0];
      productItem.product = product;
      const directionData = product.directions.find(
        dir => dir._type === 'direction' && dir._key === direction,
      );

      if (!directionData) return;

      if (product.oldId && order.promocode) {
        // code is ok, but we don't need nevatripService
        // const getSale = (
        //   await this.nevatripService.getSale(product.oldId, order.promocode)
        // )[0];
        // sale = getSale || 0;
      }

      for (const ticket of directionData.tickets) {
        if (tickets && tickets.hasOwnProperty(ticket._key)) {
          const price = Math.ceil(ticket.price - ticket.price * (sale / 100));
          sum += price * tickets[ticket._key];
          if (tickets[ticket._key]) {
            atolItems.push({
              name: `${ticket.name} билет на «${product.title.ru.name}»`,
              price: price,
              quantity: tickets[ticket._key],
              sum: price * tickets[ticket._key],
              payment_method: 'full_prepayment',
              payment_object: 'service',
              vat: {
                type: 'none',
              },
            });
          }
        }
      }
    }

    // sum = Math.ceil(sum - sum * (sale / 100));

    // code is ok, but we don't need atolService
    // if (sendToAtol) {
    //   if (!ATOLLOGIN || !ATOLTOKEN || !ATOLGROUP) {
    //     throw new HttpErrors.Unauthorized(`ATOL credentials is not defined`);
    //   }

    //   const atolToken = await this.atolService.getToken(ATOLLOGIN, ATOLTOKEN);
    //   const token = atolToken[0].token;
    //   const timestamp = _format(new Date(), 'dd.MM.yyyy HH:mm:ss', {
    //     locale: ru,
    //   });
    //   const atolReceipt = {
    //     client: {
    //       //email: order.user.email,
    //       phone: '+' + (order.user.phone.match(/\d+/g) || []).join(''),
    //     },
    //     company: {
    //       email: 'info@nevatrip.ru',
    //       sno: 'usn_income',
    //       inn: '7802873242',
    //       payment_address: 'nevatrip.ru',
    //     },
    //     items: atolItems,
    //     payments: [
    //       {
    //         type: 1,
    //         sum: sum,
    //       },
    //     ],
    //     vats: [
    //       {
    //         type: 'none',
    //         sum: 0,
    //       },
    //     ],
    //     total: sum,
    //   };
    //   const atolResponse = await this.atolService.postSell(
    //     token,
    //     ATOLGROUP,
    //     timestamp,
    //     order.id || 'test_' + order.sessionId,
    //     {
    //       callback_url: `https://api.nevatrip.ru/orders/${order.id}/ofd`,
    //     },
    //     atolReceipt,
    //   );

    //   order.ofd = atolResponse;
    // }

    return sum;
  }

  async getPayment(order: Order) {
    if (!privateKey || !publicId) {
      throw new HttpErrors.Unauthorized(`Payment gateway is not defined`);
    }

    // if (!order.sum && !order.isFullDiscount) {
    //   throw new HttpErrors.PaymentRequired(`Ошибка суммы`);
    // }

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
      phone: (order.user.phone.match(/\d+/g) || []).join(''),
    });

    if (!payment.isSuccess()) {
      throw new HttpErrors.NotFound(`Платёж не прошёл…`);
    }

    return payment.getResponse();
  }

  @post('/orders', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Order } } },
      },
    },
  })
  async create(@requestBody() cart: Cart): Promise<Order> {
    const order = (await this.getCart(cart)) as Order;
    order.sum = await this.getSum(order);

    if (order.sum) {
      order.payment = await this.getPayment(order);
    } else {
      order.status = 'paid';
      order.updated = new Date();
    }

    order.hash = getHash(order.user.email);

    const newOrder = await this.orderRepository.create(order);

    if (order.sum) {
      // sendEmail(newOrder, 'new');
    } else {
      sendEmail(newOrder, 'paid');

      if (order.user.fullName.toLowerCase() !== 'test') {
        sendEmail(newOrder, 'manager');
      }
    }

    return newOrder;
  }

  @post('/orders/check', {
    responses: { '200': { description: 'Check CloudPayment' } },
  })
  async check(
    @requestBody({
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              InvoiceId: { type: 'number' },
              Amount: { type: 'number' },
            },
          },
        },
      },
    })
    body: PaymentSuccessModel,
  ) {
    const filter: Filter<Order> = {
      where: { 'payment.Model.Number': body.InvoiceId } as Where<Order>,
    };
    const order = await this.orderRepository.findOne(filter);

    if (!order || (await this.getSum(order)) !== body.Amount) return { code: 10 };

    return { code: 0 };
  }

  @post('/orders/pay', {
    responses: { '200': { description: 'pay CloudPayment' } },
  })
  async pay(
    @requestBody({
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              TransactionId: { type: 'number' },
              Amount: { type: 'number' },
              InvoiceId: { type: 'number' },
              AuthCode: { type: 'string' },
              Token: { type: 'string' },
            },
          },
        },
      },
    })
    body: PaymentSuccessModel,
  ) {
    const filter: Filter<Order> = {
      where: { 'payment.Model.Number': body.InvoiceId } as Where<Order>,
    };
    const order = await this.orderRepository.findOne(filter);

    if (!order || !order.id) return { code: 10 };

    // const sum = await this.getSum(order, true); // true — sendToAtol
    const sum = await this.getSum(order, false);

    if (sum !== body.Amount) return { code: 10 };

    order.status = 'paid';
    order.updated = new Date();
    order.payment = {
      Model: body,
    };

    order.hash = getHash(order.user.email);

    sendEmail(order, 'paid');

    if (order.user.fullName.toLowerCase() !== 'test') {
      sendEmail(order, 'manager');
    }

    this.orderRepository.updateById(order.id, order);
    return { code: 0 };
  }

  @post('/orders/fail', {
    responses: { '200': { description: 'fail CloudPayment' } },
  })
  async fail(@requestBody() body: {}) {
    console.log('fail CloudPayment', body);
    return body;
  }

  @get('/orders/count', {
    responses: {
      '200': {
        description: 'Order model count',
        content: { 'application/json': { schema: CountSchema } },
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
            schema: { type: 'array', items: { 'x-ts-type': Order } },
          },
        },
      },
    },
  })
  async find(
    @param.query.string('token')
    token: string,
    @param.query.string('format')
    format?: string,
    @param.query.object('filter', getFilterSchemaFor(Order))
    filter?: Filter<Order>,
  ): Promise<Order[] | Response | void> {
    if (token !== secret) {
      throw new HttpErrors.Unauthorized(`Token is incorrect`);
    }

    // if (!this.orderRepository.dataSource.connected) {
    //   await this.orderRepository.dataSource.connect();
    // }

    // const orderCollection = (this.orderRepository.dataSource // tslint:disable-next-line: no-any
    //   .connector as any).collection('Order');

    // console.log(`filter`, filter);

    // const request = await orderCollection.aggregate([{$match: filter}]).get();

    // console.log(`request`, request);

    const orders = await this.orderRepository.find(filter);

    if (format === 'csv') {
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet('Orders');
      sheet.state = 'visible';
      const table = sheet.addTable({
        name: 'MyTable',
        ref: 'A1',
        headerRow: true,
        style: {
          theme: 'TableStyleMedium2',
          showRowStripes: true,
        },
        columns: [
          { name: 'Имя' },
          { name: 'Почта' },
          { name: 'Телефон' },
          { name: 'Экскурсия' },
          { name: 'Билет' },
          { name: 'Количество' },
          { name: 'Стоимость' },
          { name: 'Посадочный номер' },
          { name: 'Создан' },
          { name: 'Обновлён' },
          { name: 'Сумма' },
          { name: 'Транзакция' },
          { name: 'Статус' },
          { name: 'Промокод' },
        ],
        rows: [],
      });

      orders.forEach(order => {
        const {
          TransactionId = 0,
          InternalId = 0,
          // @ts-ignore
        } = (order.payment || {}).Model || {};
        order.products.forEach(({ product, options }) => {
          options.forEach(({ number, direction, tickets }) => {
            const productDirection = product.directions.find(
              ({ _key }) => _key === direction,
            );
            if (productDirection) {
              productDirection.tickets.forEach(
                ({ category, name, price, _key }) => {
                  if (tickets[_key]) {
                    // @ts-ignore
                    table.addRow([
                      order.user.fullName,
                      order.user.email,
                      order.user.phone,
                      product.title.ru.name,
                      category.title + ' ' + name,
                      tickets[_key],
                      price,
                      order.status === 'paid' && number ? `НТ${number}` : '',
                      new Date(order.created),
                      order.updated ? new Date(order.updated) : '',
                      order.sum,
                      order.status === 'paid' ? TransactionId : InternalId,
                      order.status,
                      order.promocode,
                    ]);
                  }
                },
              );
            }
          });
        });
      });

      table.commit();

      this.res.setHeader(
        'Content-Disposition',
        'attachment; filename="orders.xls"',
      );

      this.res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8',
      );

      const file = await workbook.xlsx.writeBuffer();
      return this.res.end(file, 'binnary');
      // return this.res.send(Buffer.from(file));

      const _this = this;
      workbook.xlsx.writeBuffer().then(function (buffer) {
        return _this.res.end(buffer, 'binnary');
        // done
      });
    }

    return orders;
  }

  @patch('/orders', {
    responses: {
      '200': {
        description: 'Order PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
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
        content: { 'application/json': { schema: { 'x-ts-type': Order } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Order> {
    return await this.orderRepository.findById(id);
  }

  @get('/orders/{id}/email', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'text/html': { schema: {} } },
        examples: {
          'text/html': '<html><body>Your HTML text</body></html>',
        },
      },
    },
  })
  async emailById(
    @param.path.string('id') id: string,
    @param.query.string('hash') hash: string,
  ): Promise<Response> {
    const api = await this.orderRepository.findById(id);

    checkHash(api.user.email, hash);

    api.hash = getHash(api.user.email);

    this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');

    return this.res.send(renderEmail.renderEmail({ page: 'notification', api }));
  }

  @get('/orders/{id}/email/send', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'text/html': { schema: {} } },
        examples: {
          'text/html': '<html><body>Your HTML text</body></html>',
        },
      },
    },
  })
  async sendEmailById(
    @param.path.string('id') id: string,
    @param.query.string('hash') hash: string,
    @param.query.string('email') email?: string,
  ): Promise<Response> {
    const order = await this.orderRepository.findById(id);
    const userEmail = order.user.email;

    checkHash(userEmail, hash);

    order.hash = getHash(userEmail);

    sendEmail(order, 'paid', email);

    this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');

    return this.res.send(
      renderEmail.renderEmail({ page: 'notification', api: order }),
    );
  }

  @get('/orders/{id}/operator', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'text/html': { schema: {} } },
        examples: {
          'text/html': '<html><body>Your HTML text</body></html>',
        },
      },
    },
  })
  async operatorById(
    @param.path.string('id') id: string,
    @param.query.string('hash') hash: string,
  ): Promise<Response> {
    const api = await this.orderRepository.findById(id);

    checkHash(api.user.email, hash);

    api.hash = getHash(api.user.email);

    this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');

    return this.res.send(renderEmail.renderEmail({ page: 'operator-en', api }));
  }

  @get('/orders/{id}/print', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'text/html': { schema: {} } },
        examples: {
          'text/html': '<html><body>Your HTML text</body></html>',
        },
      },
    },
  })
  async printById(
    @param.path.string('id') id: string,
    @param.query.string('hash') hash: string,
  ): Promise<Response> {
    const api = await this.orderRepository.findById(id);

    checkHash(api.user.email, hash);

    api.hash = getHash(api.user.email);

    this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');

    return this.res.send(renderEmail.renderEmail({ page: 'print', api }));
  }

  @get('/orders/{id}/preview', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: { 'text/html': { schema: {} } },
        examples: {
          'text/html': '<html><body>Your HTML text</body></html>',
        },
      },
    },
  })
  async previewById(
    @param.path.string('id') id: string,
    @param.query.string('hash') hash: string,
  ): Promise<Response> {
    const api = await this.orderRepository.findById(id);

    checkHash(api.user.email, hash);

    api.hash = getHash(api.user.email);

    this.res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    this.res.setHeader('Access-Control-Allow-Origin', '*');
    this.res.setHeader('X-FRAME-OPTIONS', 'ALLOWALL');

    return this.res.send(renderEmail.renderEmail({ page: 'notification', api }));
  }

  @patch('/orders/{id}', {
    responses: { '204': { description: 'Order PATCH success' } },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  @put('/orders/{id}', {
    responses: { '204': { description: 'Order PUT success' } },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}', {
    responses: { '204': { description: 'Order DELETE success' } },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
