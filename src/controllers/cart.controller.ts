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
import {Cart, CartProduct} from '../models';
import {CartRepository} from '../repositories';
import hash from 'object-hash';

export class CartController {
  constructor(
    @repository(CartRepository)
    public cartRepository : CartRepository,
  ) {}

  /**
   * Add an product to the shopping cart for a given user
   * @param session User's session
   */
  @post('/carts/{session}/products', {
    responses: {'200': {description: 'New product to Cart'}},
    summary: 'Add new product to Cart',
  })
  async addProduct(
    @param.path.string('session') session: string,
    @requestBody({description: 'shopping cart product'})
    product: CartProduct,
  ) {
    await this.cartRepository.addProduct(session, product);
  }

  /**
   * Retrieve the shopping cart by user id
   * @param session User's session
   */
  @get('/carts/{session}', {
    responses: {'200': {description: 'Cart Response'}},
    summary: 'Get Cart by session Id',
  })
  async get(@param.path.string('session') session: string) {
    const cart = await this.cartRepository.get(session);
    if (cart == null) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${session}`,
      );
    } else {
      return cart;
    }
  }

  /**
   * Create or update the shopping cart for a given user
   * @param session User's session
   * @param cart Shopping cart
   */
  @put('/carts/{session}', {
    responses: {
      '200': {
        description: 'Update Cart',
      },
    },
    summary: 'Replace Cart with new data',
  })
  async set(
    @param.path.string('session') session: string,
    @requestBody({description: 'shopping cart'}) cart: Cart,
  ) {
    if (session !== cart.session) {
      throw new HttpErrors.BadRequest(
        `User id does not match: ${session} !== ${cart.session}`,
      );
    }

    cart.created = cart.created || new Date();
    cart.updated = new Date();
    cart.products.forEach((product: { key: string; }) => {
      delete product.key;
      product.key = hash(product);
    });

    await this.cartRepository.set(session, cart);
  }

  /**
   * Add an product to the shopping cart for a given user
   * @param session User's session
   * @param key Cart product key
   */
  @del('/carts/{session}/products/{key}', {
    responses: {'200': {description: "Cart's product to delete"}},
    summary: "Delete Cart's product by key",
  })
  async deleteProduct(
    @param.path.string('session') session: string,
    @param.path.string('key') key: string,
  ) {
    await this.cartRepository.deleteProduct(session, key);
  }
}
