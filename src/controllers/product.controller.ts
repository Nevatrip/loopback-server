import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, HttpErrors} from '@loopback/rest';
import {SanityService} from '../services/sanity.service';
import {SanityRepository} from "../repositories";
import {parse, format} from 'date-fns';
import {findTimeZone, getUTCOffset} from 'timezone-support';
import {Product, IAction} from '../models';

const TIMEZONE = process.env.TIMEZONE;
if (!TIMEZONE) throw new Error('TIMEZONE (env) is not defined');

const parseCache = (cache: string) => {
  switch(cache.toLowerCase().trim()){
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    case "cdn": return 'cdn';
    default: return Boolean(cache);
  }
}

type Dates = {
  [key: string]: {}[]
};

const sortDates = (dates: Dates): Date[] => {
  return Object.keys(dates)
    .map(date => new Date(date))
    .sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });
};

export class ProductController {
  constructor(
    @inject('services.SanityService')
    protected sanityService: SanityService,
    @repository(SanityRepository)
    protected sanityRepository: SanityRepository
  ) {}

  @get('/sanity', {
    responses: {'200': {description: 'Proxy Sanity'}},
    summary: 'Get data from Sanity',
  })
  async proxySanity(
    @param.query.string('query') query: string,
    @param.query.string('cache', { description: 'Вернуть данные из кэша (по умолчанию) или из CDN', schema: { type: 'string', default: true, enum: [true, false, 'cdn'] } }) cache: 'true' | 'false' | 'cdn' = 'true',
    @param.query.number('ttl', { description: 'Срок жизни кэша в миллисекундах (по умолчанию 14400000, т. е. 4 часа)', example: '14400000' }) ttl: number = 1000 * 60 * 60 * 4,
  ): Promise<Object> {
    const useCache = parseCache(cache);

    // TODO: это точно можно переписать на более элегантное решение
    if (useCache === true) {
      // Берём данные из Redis
      const redis = await this.sanityRepository.get(query);

      // Данных нет, делаем новый запрос к Sanity…
      if (redis === null) {
        const [response] = await this.sanityService.proxySanity(query);
        // …и сохраняем его в кэш для следующих запросов
        await this.sanityRepository.set(query, { query, response }, { ttl });
        return response;
      }

      return redis.response;
    } else {
      // Берём данные из Sanity
      const [response] = await this.sanityService.proxySanity(query, useCache === false ? 'api' : 'apicdn' );
      await this.sanityRepository.set(query, { query, response }, { ttl });

      return response;
    }
  }

  @get('/product/{id}/cart', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data for cart by Id',
  })
  async getProductForCartById(
    @param.path.string('id') id: string,
    @param.query.string('lang') lang: string = 'ru',
    @param.query.string('cache', { description: 'Вернуть данные из кэша (по умолчанию) или из CDN', schema: { type: 'string', default: true, enum: [true, false, 'cdn'] } }) cache: 'true' | 'false' | 'cdn' = 'true',
    @param.query.number('ttl', { description: 'Срок жизни кэша в миллисекундах (по умолчанию 14400000, т. е. 4 часа)', example: '14400000' }) ttl: number = 1000 * 60 * 60 * 4,
  ) {
    if (!TIMEZONE) throw new HttpErrors.NotFound('TIMEZONE (env) is not defined');

    const useCache = parseCache(cache);
    const query = `getProductForCartById(${ id }, ${ lang })`;

    const getProductForCartById = async ( id: string, lang: string, cache?: string ) => {
      const [ product ] = await this.sanityService.getProductForCartById( id, lang, cache );

      (product.directions || []).forEach(direction => {
        if (direction._type === 'complex') return direction;
        if (!direction.schedule || !direction.schedule.length) return;

        const {
          buyTimeOffset = 0,
          schedule,
        } = direction;
        let dates: Dates = {};
        let datesOpenTime: Dates = {};

        schedule.forEach(event => {
          const buyTime = new Date();
          buyTime.setMinutes( buyTime.getMinutes() + buyTimeOffset );

          const timeZone = findTimeZone(event.startTimezone || TIMEZONE);

          event.actions.forEach(action => {
            const actionDate = new Date(action.start);

            if (actionDate > buyTime) {
              const timeOffset = getUTCOffset(actionDate, timeZone).offset;

              actionDate.setMinutes(actionDate.getMinutes() + actionDate.getTimezoneOffset() - timeOffset );
              const dateKey = format(actionDate, 'yyyy-MM-dd');

              if (event.allDay) {
                datesOpenTime[dateKey] = datesOpenTime[dateKey] || [];
              } else {
                dates[dateKey] = dates[dateKey] || [];
              }
            }
          });
        });

        delete direction.schedule;
        direction.dates = sortDates(dates);
        direction.datesOpenTime = sortDates(datesOpenTime);
      });

      return product;
    }

    // TODO: это точно можно переписать на более элегантное решение
    if (useCache === true) {
      // Берём данные из Redis
      const redis = await this.sanityRepository.get( query );

      // Данных нет, делаем новый запрос к Sanity…
      if (redis === null) {
        const response = await getProductForCartById(id, lang);

        // …и сохраняем его в кэш для следующих запросов
        await this.sanityRepository.set(query, { query, response }, { ttl });
        return response;
      }

      return redis.response;
    } else {
      // Берём данные из Sanity
      const response = await getProductForCartById(id, lang, useCache === false ? 'api' : 'apicdn' );
      await this.sanityRepository.set(query, { query, response }, { ttl });

      return response;
    }
  }

  @get('/product/{id}/schedule/{directionId}/{date}', {
    responses: {'200': {description: 'Product Response'}},
    summary: "Get Product schedule by Id, direction's id and date",
  })
  async getScheduleById(
    @param.path.string('id') id: string,
    @param.path.string('directionId') directionId: string,
    @param.path.string('date') date: string,
    @param.query.string('lang') lang: string = 'en',
    @param.query.string('cache', { description: 'Вернуть данные из кэша (по умолчанию) или из CDN', schema: { type: 'string', default: true, enum: [true, false, 'cdn'] } }) cache: 'true' | 'false' | 'cdn' = 'true',
    @param.query.number('ttl', { description: 'Срок жизни кэша в миллисекундах (по умолчанию 14400000, т. е. 4 часа)', example: '14400000' }) ttl: number = 1000 * 60 * 60 * 4,
  ): Promise<IAction[]> {
    if (!TIMEZONE) throw new HttpErrors.NotFound('TIMEZONE (env) is not defined');

    const useCache = parseCache(cache);
    const query = `getScheduleById(${ id }, ${ directionId }, ${ date }, ${ lang })`;

    const getScheduleById = async ( id: string, directionId: string, date: string, lang: string, cache?: string ) => {
      const [product]: Product[] = await this.sanityService.getProductForCartById(id, lang, cache );

      const direction = product.directions.find(({ _key }) => _key === directionId);
      if (!direction) throw new HttpErrors.NotFound(`Direction with directionId ${ directionId } is not found.`);

      const { schedule, buyTimeOffset = 0 } = direction;
      if (!schedule || !schedule.length) throw new HttpErrors.NotFound(`Schedule in directionId ${ directionId } is not found.`);

      const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

      let scheduleArray: IAction[] = [];
      schedule.forEach(event => {
        const timeZone = findTimeZone(event.startTimezone || TIMEZONE);

        event.actions.forEach(action => {
          const buyTime = new Date();
          buyTime.setMinutes(buyTime.getMinutes() + buyTimeOffset);
          const actionDate = new Date(action.start);
          const isExpired = actionDate <= buyTime;
          const timeOffset = getUTCOffset(actionDate, timeZone).offset;
          actionDate.setMinutes(actionDate.getMinutes() + actionDate.getTimezoneOffset() - timeOffset);

          if ( actionDate.toDateString() === parsedDate.toDateString() ) {
            action.timeOffset = timeOffset;
            action.allDay = event.allDay;
            action.tickets = event.tickets;
            action.point = event.point;
            action.expired = isExpired;
            scheduleArray.push(action);
          }
        });
      });

      return scheduleArray;

    }

    // TODO: это точно можно переписать на более элегантное решение
    if (useCache === true) {
      // Берём данные из Redis
      const redis = await this.sanityRepository.get( query );

      // Данных нет, делаем новый запрос к Sanity…
      if (redis === null) {
        const response = await getScheduleById( id, directionId, date, lang );

        // …и сохраняем его в кэш для следующих запросов
        await this.sanityRepository.set(query, { query, response }, { ttl });
        return response;
      }

      return redis.response;
    } else {
      // Берём данные из Sanity
      const response = await getScheduleById( id, directionId, date, lang, useCache === false ? 'api' : 'apicdn' );
      await this.sanityRepository.set(query, { query, response }, { ttl });

      return response;
    }
  }

  @get('/product/{id}', {
    responses: {'200': {description: 'Product Response'}},
    summary: 'Get Product data by Id',
    deprecated: true, // в пользу query-запросов (/sanity)
  })
  async getProductById(@param.path.string('id') id: string): Promise<Product> {
    const [product] = await this.sanityService.getProductById(id);

    return product;
  }
}
