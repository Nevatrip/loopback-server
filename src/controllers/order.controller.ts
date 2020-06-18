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

export class OrderController {
  constructor(
    @repository( OrderRepository ) public orderRepository : OrderRepository,
    @repository( CartRepository ) protected cartRepository: CartRepository,
    @repository( UserRepository ) protected userRepository: UserRepository,
  ) {}

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
    filter.include = filter?.include ?? [{relation: 'customer'}];

    return this.orderRepository.findById(id, filter);
  }
}
