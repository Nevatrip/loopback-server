import {DefaultKeyValueRepository} from '@loopback/repository';
import {Cart, CartProduct} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {promisify} from 'util';
import hash from 'object-hash';

export class CartRepository extends DefaultKeyValueRepository<Cart> {
  constructor(@inject('datasources.redis') dataSource: RedisDataSource) {
    super(Cart, dataSource);
  }

  /**
   * Add an product to the shopping cart with optimistic lock to allow concurrent
   * `adding to cart` from multiple devices
   *
   * @param sessionId User's session id
   * @param product product to be added
   */
  addProduct(sessionId: string, product: CartProduct) {
    const addProductToCart = (cart: Cart | null) => {
      cart = cart || new Cart( { sessionId } );
      cart.products = cart.products || [];
      const now = new Date();
      cart.created = cart.created || now;

      if (cart.created < now) cart.updated = now;

      const key = hash({product, date: now});

      // Add to cart only unique product
      if ( !cart.products.find( product => product.key === key ) ) {
        product.key = key;
        cart.products.push(product);
      }

      return cart;
    };

    return this.checkAndSet(sessionId, addProductToCart);
  }

  deleteProduct(sessionId: string, key: string) {
    const deleteProductFromCart = (cart: Cart | null) => {
      if (cart!.products.length) {
        cart!.products = cart!.products.filter((product: CartProduct) => product.key !== key);
      }

      cart!.updated = new Date();

      return cart;
    };

    return this.checkAndSet(sessionId, deleteProductFromCart);
  }

  /**
   * Use Redis WATCH and Transaction to check and set against a key
   * See https://redis.io/topics/transactions#optimistic-locking-using-check-and-set
   *
   * Ideally, this method should be made available by `KeyValueRepository`.
   *
   * @param sessionId User's session id
   * @param check A function that checks the current value and produces a new
   * value. It returns `null` to abort.
   */
  async checkAndSet(
    sessionId: string,
    check: (current: Cart | null) => Cart | null,
  ) {
    const connector = this.kvModelClass.dataSource!.connector!;
    const execute = promisify((cmd: string, args: any[], cb: Function) => {
      return connector.execute!(cmd, args, cb);
    });
    /**
     * - WATCH sessionId
     * - GET sessionId
     * - check(cart)
     * - MULTI
     * - SET sessionId
     * - EXEC
     */
    await execute( 'WATCH', [ sessionId ] );
    let cart: Cart | null = await this.get( sessionId );
    cart = check( cart );
    if ( !cart ) return null;
    await execute( 'MULTI', [] );
    await this.set( sessionId, cart );
    // Add TTL to cart (7 days)
    await this.expire( sessionId, 7 * 24 * 60 * 60 * 1000 );
    await execute( 'EXEC', [] );
    return cart;
  }
}
