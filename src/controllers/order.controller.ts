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
} from '@loopback/rest';
import {Order, Cart} from '../models';
import {OrderRepository, CartRepository} from '../repositories';

export class OrderController {
  constructor(
    @repository(OrderRepository) public orderRepository : OrderRepository,
    @repository(CartRepository) protected cartRepository: CartRepository,
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
          schema: getModelSchemaRef(Cart, {
            title: 'NewOrder',

          }),
        },
      },
    })
    cart: Cart,
  ): Promise<Order> {
    const order = await this.cartRepository.get( cart.id ) as Order;

    return this.orderRepository.create(order);
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
