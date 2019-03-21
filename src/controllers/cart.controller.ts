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
import {Cart, CartItem} from '../models';
import {CartRepository} from '../repositories';

import * as debugFactory from 'debug';
const debug = debugFactory('loopback:example:shopping');

export class CartController {
  constructor(
    @repository(CartRepository)
    public cartRepository: CartRepository,
  ) {}

  /**
   * Create or update the shopping cart for a given user
   * @param sessionId User id
   * @param cart Shopping cart
   */
  @put('/shoppingCarts/{sessionId}')
  async set(
    @param.path.string('sessionId') sessionId: string,
    @requestBody({description: 'shopping cart'}) cart: Cart,
  ) {
    debug('Create shopping cart %s: %j', sessionId, cart);
    if (sessionId !== cart.sessionId) {
      throw new HttpErrors.BadRequest(
        `User id does not match: ${sessionId} !== ${cart.sessionId}`,
      );
    }

    cart.created = cart.created || new Date();
    cart.lastUpdated = new Date();

    await this.cartRepository.set(sessionId, cart);
  }

  /**
   * Add an item to the shopping cart for a given user
   * @param sessionId User id
   * @param cart Shopping cart item to be added
   */
  @post('/shoppingCarts/{sessionId}/items')
  async addItem(
    @param.path.string('sessionId') sessionId: string,
    @requestBody({description: 'shopping cart item'}) item: CartItem,
  ) {
    await this.cartRepository.addItem(sessionId, item);
  }

  /**
   * Retrieve the shopping cart by user id
   * @param sessionId User id
   */
  @get('/shoppingCarts/{sessionId}')
  async get(@param.path.string('sessionId') sessionId: string) {
    debug('Get shopping cart %s', sessionId);
    const cart = await this.cartRepository.get(sessionId);
    debug('Shopping cart %s: %j', sessionId, cart);
    if (cart == null) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${sessionId}`,
      );
    } else {
      return cart;
    }
  }

  /*
  @post('/carts', {
    responses: {
      '200': {
        description: 'Cart model instance',
        content: {'application/json': {schema: {'x-ts-type': Cart}}},
      },
    },
  })
  async create(@requestBody() cart: Cart): Promise<Cart> {
    return await this.cartRepository.create(cart);
  }

  @get('/carts/count', {
    responses: {
      '200': {
        description: 'Cart model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Cart)) where?: Where,
  ): Promise<Count> {
    return await this.cartRepository.count(where);
  }

  @get('/carts', {
    responses: {
      '200': {
        description: 'Array of Cart model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Cart}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Cart)) filter?: Filter,
  ): Promise<Cart[]> {
    return await this.cartRepository.find(filter);
  }

  @patch('/carts', {
    responses: {
      '200': {
        description: 'Cart PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() cart: Cart,
    @param.query.object('where', getWhereSchemaFor(Cart)) where?: Where,
  ): Promise<Count> {
    return await this.cartRepository.updateAll(cart, where);
  }

  @get('/carts/{id}', {
    responses: {
      '200': {
        description: 'Cart model instance',
        content: {'application/json': {schema: {'x-ts-type': Cart}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Cart> {
    return await this.cartRepository.findById(id);
  }

  @patch('/carts/{id}', {
    responses: {
      '204': {
        description: 'Cart PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() cart: Cart,
  ): Promise<void> {
    await this.cartRepository.updateById(id, cart);
  }

  @put('/carts/{id}', {
    responses: {
      '204': {
        description: 'Cart PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() cart: Cart,
  ): Promise<void> {
    await this.cartRepository.replaceById(id, cart);
  }

  @del('/carts/{id}', {
    responses: {
      '204': {
        description: 'Cart DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.cartRepository.deleteById(id);
  }
*/
}
