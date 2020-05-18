import { service } from '@loopback/core';
import { SanityService, SanityProvider } from '../services';
import { SanityRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { get, param, HttpErrors, del } from '@loopback/rest';

const schema = {
  cache: {
    description: 'Вернуть данные из кэша (по умолчанию) или из CDN',
    schema: {
      type: 'string',
      default: true,
      enum: [ true, false, 'cdn' ]
    }
  },
  ttl: {
    description: 'Срок жизни кэша в миллисекундах (по умолчанию 14400000, т. е. 4 часа)',
    example: '14400000'
  }
}

const parseCache = ( cache: string ) => {
  switch( cache.toLowerCase().trim() ){
    case 'true': case '1': case 'yes': return true;
    case 'false': case '0': case 'no': case null: return false;
    case 'cdn': return 'cdn';
    default: return Boolean( cache );
  }
}

export class SanityController {
  constructor(
    @service( SanityProvider )
    protected sanityService: SanityService,
    @repository( SanityRepository )
    protected sanityRepository: SanityRepository,
  ) {}

  @get( '/sanity', {
    responses: { '200': { description: 'Proxy Sanity' } },
    summary: 'Get data from Sanity',
  } )
  async sanityProxy(
    @param.query.string( 'query' ) query: string,
    @param.query.string( 'cache', schema.cache ) cache: 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'cdn' = 'true',
    @param.query.number( 'ttl', schema.ttl ) ttl: number = 1000 * 60 * 60 * 4,
  ): Promise<Object> {
    const useCache = parseCache( cache );

    if ( useCache === true ) {
      const redis = await this.sanityRepository.get( query );

      if ( redis !== null ) {
        return redis.result;
      }
    }

    const [ { result } ] = await this.sanityService.proxySanity( query, useCache === 'cdn' ? 'apicdn' : 'api' )
    await this.sanityRepository.set( query, { query, result }, { ttl } );

    return result;
  }

  @get( '/sanity/cache', {
    responses: { '200': { description: 'Proxy Sanity' } },
    summary: 'Get cached keys',
  } )
  async sanityCache() {
    const keys = await this.sanityRepository.keys({ match: '*' });

    const response = [];
    for await (let key of keys) {
      const ttl = await this.sanityRepository.ttl( key );
      response.push( { key, ttl } );
    }

    return response;
  }

  @del( '/sanity/cache', {
    responses: { '200': { description: 'Proxy Sanity' } },
    summary: 'Clear cache',
  } )
  async sanityCacheClear() {
    await this.sanityRepository.deleteAll();
  }
}
