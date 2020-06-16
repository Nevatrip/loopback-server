import { DefaultKeyValueRepository } from '@loopback/repository';
import { inject } from '@loopback/core';
import { promisify } from 'util';
import { Cart, CartProduct } from '../models';
import { CartDataSource } from '../datasources';
import hash from 'object-hash';

export class CartRepository extends DefaultKeyValueRepository<
  Cart
> {
  constructor(
    @inject('datasources.cart') dataSource: CartDataSource,
  ) {
    super(Cart, dataSource);
  }

  /**
   * Add an product to the shopping cart with optimistic lock to allow concurrent
   * `adding to cart` from multiple devices
   *
   * @param id User's session id
   * @param product product to be added
   */
  addProduct( id: string, product: CartProduct ) {
    const addProductToCart = (cart: Cart | null) => {
      cart = cart ?? new Cart( { id } );
      cart.products = cart.products ?? [];
      const now = new Date();
      cart.created = cart.created ?? now;

      if (cart.created < now) cart.updated = now;

      const key = hash( { product } );

      // Add to cart only unique product
      if ( !cart.products.find( product => product.key === key ) ) {
        product.key = key;
        cart.products.push( product );
      }

      return cart;
    };

    return this.checkAndSet( id, addProductToCart );
  }

  deleteProduct( id: string, key: string ) {
    const deleteProductFromCart = ( cart: Cart | null ) => {
      if ( cart!.products.length ) {
        cart!.products = cart!.products.filter( product => product.key !== key );
      }

      cart!.updated = new Date();

      return cart;
    };

    return this.checkAndSet( id, deleteProductFromCart );
  }

  /**
   * Use Redis WATCH and Transaction to check and set against a key
   * See https://redis.io/topics/transactions#optimistic-locking-using-check-and-set
   *
   * Ideally, this method should be made available by `KeyValueRepository`.
   *
   * @param id User's session id
   * @param check A function that checks the current value and produces a new
   * value. It returns `null` to abort.
   */
  async checkAndSet(
    session: string,
    check: ( current: Cart | null ) => Cart | null,
  ) {
    const connector = this.kvModelClass.dataSource!.connector!;
    const execute = promisify( ( cmd: string, args: any[], cb: Function ) => {
      return connector.execute!( cmd, args, cb );
    });
    /**
     * - WATCH session
     * - GET session
     * - check(cart)
     * - MULTI
     * - SET session
     * - EXEC
     */
    await execute( 'WATCH', [ session ] );
    let cart: Cart | null = await this.get( session );
    cart = check( cart );
    if ( !cart ) return null;
    await execute( 'MULTI', [] );
    await this.set( session, cart );
    // Add TTL to cart (7 days)
    await this.expire( session, 7 * 24 * 60 * 60 * 1000 );
    await execute( 'EXEC', [] );
    return cart;
  }
}
