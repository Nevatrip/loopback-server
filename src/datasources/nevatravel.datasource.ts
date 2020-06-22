import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

if (!process.env.PARTNER_NEVATRAVEL_KEY) {
  throw new Error('NEVATRAVEL API code is not defined');
}

if (!process.env.PARTNER_NEVATRAVEL_HOST) {
  throw new Error('NEVATRAVEL HOST is not defined');
}

const apiKey: string = process.env.PARTNER_NEVATRAVEL_KEY;
const apiHost: string = process.env.PARTNER_NEVATRAVEL_HOST;
const apiUrl = `http://${ apiHost }/partner_api`;

const config = {
  name: 'nevatravel',
  connector: 'rest',
  baseURL: apiUrl,
  crud: false,
  operations: [
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/get_api_status`,
        query: {
          auth_key: apiKey
        }
      },
      functions: {
        getStatus: []
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/get_piers_info`,
        query: {
          auth_key: apiKey
        }
      },
      functions: {
        getPiers: []
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/get_programs_info`,
        query: {
          auth_key: apiKey
        }
      },
      functions: {
        getPrograms: []
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/get_cruises_info`,
        query: {
          auth_key: apiKey,
          program: "{service}",
          start_date: "{start}",
          pier: "{point}"
        }
      },
      functions: {
        getСruises: [
          "service",
          "start",
          "point"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/request_order`,
        query: {
          auth_key: apiKey,
          tickets: "{tickets}",
          cruise_id: "{tour}",
          back_cruise_id: "{tourBack}",
          cruise_date: "{date}",
          pier_id: "{point}",
          program_id: "{service}",
          back_program_id: "{serviceBack}"
        }
      },
      functions: {
        postOrderFixedTime: [
          "tickets",
          "tour",
          "tourBack"
        ],
        postOrderOpenTime: [
          "tickets",
          "date",
          "point",
          "service",
          "serviceBack"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/get_order_status`,
        query: {
          auth_key: apiKey,
          order_id: "{order}"
        }
      },
      functions: {
        getOrder: [
          "order"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/comment_order`,
        query: {
          auth_key: apiKey,
          order_id: "{order}",
          comment: "{comment}"
        }
      },
      functions: {
        postOrderComment: [
          "order",
          "comment"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/reject_order`,
        query: {
          auth_key: apiKey,
          order_id: "{order}",
          require_confirmation: "{requireConfirmation}"
        }
      },
      functions: {
        approveOrder: [
          "order",
          "requireConfirmation"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: `${ apiUrl }/reject_order`,
        query: {
          auth_key: apiKey,
          order_id: "{order}",
          comment: "{comment}"
        }
      },
      functions: {
        rejectOrder: [
          "order",
          "comment"
        ]
      }
    }
  ]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class NevatravelDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'nevatravel';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.nevatravel', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
