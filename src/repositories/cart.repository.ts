import {DefaultKeyValueRepository} from '@loopback/repository';
import {Cart, CartItem} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {promisify} from 'util';
import * as hash from 'object-hash';

export class CartRepository extends DefaultKeyValueRepository<Cart> {
  constructor(@inject('datasources.redis') dataSource: RedisDataSource) {
    super(Cart, dataSource);
  }

  /**
   * Add an item to the shopping cart with optimistic lock to allow concurrent
   * `adding to cart` from multiple devices
   *
   * @param sessionId User's session id
   * @param item Item to be added
   */
  addItem(sessionId: string, item: CartItem) {
    const addItemToCart = (cart: Cart | null) => {
      cart = cart || new Cart({sessionId});
      cart.items = cart.items || [];

      delete item.key;
      item.key = hash(item);

      cart.items.push(item);
      return cart;
    };
    return this.checkAndSet(sessionId, addItemToCart);
  }

  deleteItem(sessionId: string, key: string) {
    const deleteItemFromCart = (cart: Cart) => {
      if (cart.items && cart.items.length) {
        cart.items = cart.items.filter((item: CartItem) => {
          return item.key !== key;
        });
      }

      return cart;
    };
    return this.checkAndSet(sessionId, deleteItemFromCart);
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
