import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const projectId = process.env.SANITY_STUDIO_API_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_API_DATASET;

const baseURL = `https://${projectId}.{CDNDomain=apicdn:string}.sanity.io/v1/data/query/${dataset}`;

const config = {
  name: 'sanity',
  connector: 'rest',
  baseURL,
  operations: [
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query: '{!query:string}',
        },
        responsePath: '$.result',
      },
      functions: {
        proxySanity: ['query', 'CDNDomain'],
      },
    },
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query:
            "*[_type=='tour' && key.current=='{alias}']\u007B...,'point':point->,'place':place->,'category':category->,'attractions':attractions[]->,'tourLanguage':tourLanguage[]->\u007Btitle,'icon':icon.asset->\u007D,'placeFeatures':placeFeatures[]->\u007Btitle,'icon':icon.asset->\u007D,'titleImage':titleImage.asset->\u007Burl\u007D.url\u007D",
        },
        responsePath: '$.result[0]',
      },
      functions: {
        getProductByAlias: ['alias'],
      },
    },
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query:
            "*[_type=='tour' && _id=='{id}']\u007B...,'point':point->,'place':place->,'category':category->,'attractions':attractions[]->,'tourLanguage':tourLanguage[]->\u007Btitle,'icon':icon.asset->\u007D,'placeFeatures':placeFeatures[]->\u007Btitle,'icon':icon.asset->\u007D,'titleImage':titleImage.asset->\u007Burl\u007D.url\u007D",
        },
        responsePath: '$.result[0]',
      },
      functions: {
        getProductById: ['id'],
      },
    },
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query:
            "*[_id=='{id}']\u007B_id,oldId,title,'key': title.{lang}.key.current,'directions': directions[]\u007B_key,_type,title,nested,isEveryOwnDate,buyTimeOffset,'point': point->\u007B'coords': coords\u007Blat,lng\u007D,description,'key': key.current,'title': title.{lang}\u007D,'schedule': schedule[]\u007B...,'point': point->\u007B'coords': coords\u007Blat,lng\u007D,'description': description.{lang},'key': key.current,'title': title.{lang}\u007D,'ticket': ticket[]->\u007D,'tickets': tickets[]\u007B...,'category': category->\u007B'name': name.current,title\u007D,'ticket': ticket[]->\u007B'name': name.current,title\u007D\u007D\u007D\u007D",
        },
        responsePath: '$.result[0]',
      },
      functions: {
        getProductForCartById: ['id', 'lang', 'CDNDomain'],
      },
    },
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query:
            "*[_id=='{id}']\u007B_id,oldId,title,'partner':partner->,'category':category->,'directions':directions[]\u007B_key,'ticketInfo':ticketInfo[],_type,title,buyTimeOffset,partnerName,partner->,point->,'tickets':tickets[]\u007B...,'category':category->,'ticket':ticket[]->\u007D\u007D\u007D",
        },
        responsePath: '$.result[0]',
      },
      functions: {
        getProductForOrderById: ['id'],
      },
    },
  ],
};

export class SanityDataSource extends juggler.DataSource {
  static dataSourceName = 'sanity';

  constructor(
    @inject('datasources.config.sanity', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
