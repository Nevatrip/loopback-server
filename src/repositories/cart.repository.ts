import {DefaultKeyValueRepository} from '@loopback/repository';
import {Cart, CartProduct} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {promisify} from 'util';
import * as hash from 'object-hash';

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
      cart = cart || new Cart({sessionId});
      cart.products = cart.products || [];
      cart.created = cart.created || new Date();
      cart.lastUpdated = new Date();

      delete product.key;
      product.key = hash({product, date: new Date()});

      cart.products.push(product);
      return cart;
    };
    return this.checkAndSet(sessionId, addProductToCart);
  }

  deleteProduct(sessionId: string, key: string) {
    const deleteProductFromCart = (cart: Cart | null) => {
      if (cart && cart.products && cart.products.length) {
        cart.products = cart.products.filter((product: CartProduct) => {
          return product.key !== key;
        });
      }

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
    // tslint:disable-next-line:no-any
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
    await execute('WATCH', [sessionId]);
    let cart: Cart | null = await this.get(sessionId);
    cart = check(cart);
    if (!cart) return null;
    await execute('MULTI', []);
    await this.set(sessionId, cart);
    await execute('EXEC', []);
    return cart;
  }
}
