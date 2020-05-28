import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

const {
  SANITY_STUDIO_API_PROJECT_ID: projectId = 'string',
  SANITY_STUDIO_API_DATASET: dataset = 'string',
} = process.env;

const baseURL = `https://${ projectId }.{CDNDomain=apicdn:string}.sanity.io/v1/data/query/${ dataset }`;

const config = {
  name: 'sanity',
  connector: 'rest',
  baseURL,
  crud: false,
  operations: [
    {
      template: {
        method: 'GET',
        url: baseURL,
        query: {
          query: '{!query:string}',
        },
        responsePath: '$',
      },
      functions: {
        proxySanity: ['query', 'CDNDomain'],
      },
    },
  ]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class SanityDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'sanity';
  static readonly defaultConfig = config;

  constructor(
    @inject( 'datasources.config.sanity', { optional: true } )
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }


}
