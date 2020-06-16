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
   * Retrieve the cart sum by user id
   * @param session User's session
   */
  @get('/carts/{session}/sum', {
    responses: {'200': {description: 'Cart Sum Response'}},
    summary: 'Get Cart Sum by session Id',
  })
  async getCartSum(@param.path.string('session') session: string) {
    const cart = await this.cartRepository.get( session );
    if (cart == null) {
      throw new HttpErrors.NotFound(
        `Shopping cart not found for user: ${ session }`,
      );
    } else {
      const productController = new ProductController( this.sanityService, this.sanityRepository );
      const products: { [productId: string]: Product } = {};

      const result = await cart.products.reduce( async ( sum, { productId, options } ) => {
        products[ productId ] = products[ productId ] ?? await productController.getProductForCart( productId, cart.lang );
        const product = products[ productId ];

        const ticketsSum = options?.reduce( ( subSum, option ) => {
          const direction = product.directions.find( direction => direction._key === option.direction );
          direction?.tickets.forEach( ({ _key, price }) => {
            const count = option.tickets[ _key ] || 0;
            subSum += price * count;
          } );
          return subSum;
        }, 0 ) || 0;

        return (await sum) + ticketsSum;
      }, Promise.resolve( 0 ) );

      return result;
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
    if ( session !== cart.id ) {
      throw new HttpErrors.BadRequest(
        `User id does not match: ${ session } !== ${ cart.id }`,
      );
    }

    cart.created = cart.created || new Date();
    cart.updated = new Date();
    cart.products.forEach( product => {
      // delete product.key;
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
