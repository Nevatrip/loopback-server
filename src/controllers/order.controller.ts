import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Order, OrderRequest, Product, User} from '../models';
import {OrderRepository, CartRepository, UserRepository, SanityRepository} from '../repositories';
import { ClientService, TaxationSystem, ValidCurrency, BaseResponse, CurrencyList, PaymentSuccessResponse } from 'cloudpayments';
import { ProductController } from '.';
import { service } from '@loopback/core';
import { SanityProvider, SanityService } from '../services';

export class OrderController {
  constructor(
    @repository( OrderRepository ) public orderRepository : OrderRepository,
    @repository( CartRepository ) protected cartRepository: CartRepository,
    @repository( UserRepository ) protected userRepository: UserRepository,
    @repository( SanityRepository ) protected sanityRepository: SanityRepository,
    @service( SanityProvider ) protected sanityService: SanityService,
  ) {}

  async getPayment( { sum }: Order, user: User ): Promise< Order[ 'payment' ] > {
    const paymentType = process.env.PAYMENT_TYPE?.toLowerCase() || 'cloudpayments';
    const paymentCurrency = process.env.PAYMENT_CURRENCY?.toUpperCase() as ValidCurrency || CurrencyList.EUR;
    const paymentInn: number = parseInt( <string>process.env.PAYMENT_INN, 10 );
    const {
      PAYMENT_ID: paymentId,
      PAYMENT_SECRET: paymentSecret,
    } = process.env;

    if ( !paymentSecret || !paymentId ) throw new HttpErrors.Unauthorized(`Payment gateway is not defined`);
    if ( !paymentInn ) throw new HttpErrors.Unauthorized(`Payment INN is not defined`);

    if ( sum > 0 ) {
      switch ( paymentType ) {
        case 'cloudpayments':
          const client = new ClientService({
            privateKey: paymentSecret,
            publicId: paymentId,
            org: {
              taxationSystem: TaxationSystem.SIMPLIFIED_INCOME,
              inn: paymentInn,
            },
          }).getClientApi();

          const payment = await client.createOrder({
            Amount: sum,
            Currency: paymentCurrency,
            Description: `Checkout order`,
            email: user.email,
            phone: <string><unknown>user.phone,
          });

          if ( payment.isSuccess() ) return {
            service: 'cloudpayments',
            request: payment.getResponse() as PaymentSuccessResponse
          }

          throw new HttpErrors.NotFound(`Платёж не прошёл…`);

        case 'yandexkassa':
          return {
            service: 'yandexkassa',
            request: {}
          }

        case 'fullDiscount':
          return {
            service: 'fullDiscount',
            request: {}
          }

        default:
          throw new HttpErrors.PaymentRequired(`Payment type is not defined`);
      }
    }
  }

  @post('/orders', {
    responses: {
      200: {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  async createOrder(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderRequest, {
            title: 'NewOrder',

          }),
        },
      },
    })
    { cart: _cart, user: _user }: OrderRequest,
  ): Promise<Order> {
    const cart = await this.cartRepository.get( _cart ) as Order;

    if ( !cart.products?.length ) throw new HttpErrors.NotFound(`Cart is empty`);

    const productController = new ProductController( this.sanityService, this.sanityRepository );
    const products: { [productId: string]: Product } = {};

    cart.products = await Promise.all( cart.products.map( async _product => {
      let { productId } = _product;
      products[ productId ] = products[ productId ] ?? await productController.getProductForCart( productId, cart.lang );
      _product.product = products[ productId ];

      return _product;
    } ) );

    cart.payment = await this.getPayment( cart, _user )

    const user = await this.userRepository.findOrCreate( { where: { email: _user.email } }, _user );

    return await this.userRepository.orders( user.id ).create( cart );
  }

  // @post('/orders', {
  //   responses: {
  //     200: {
  //       description: 'Order model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(Order)}},
  //     },
  //   },
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Order, {
  //           title: 'NewOrder',

  //         }),
  //       },
  //     },
  //   })
  //   order: Order,
  // ): Promise<Order> {
  //   return this.orderRepository.create(order);
  // }

  @get('/orders', {
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.orderRepository.find(filter);
  }

  @get('/orders/{id}', {
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Order, {exclude: 'where'}) filter?: FilterExcludingWhere<Order>
  ): Promise<Order> {
    filter = filter ?? {};
    filter.include = filter?.include ?? [{relation: 'user'}];

    return this.orderRepository.findById(id, filter);
  }
}
