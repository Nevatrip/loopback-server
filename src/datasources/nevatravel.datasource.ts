import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'nevatravel',
  connector: 'rest',
  baseURL: 'http://ntcm.neva.travel:3000/partner_api/',
  crud: false,
  operations: [
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/get_api_status",
        query: {
          auth_key: "{authKey}"
        }
      },
      functions: {
        getStatus: [
          "authKey"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/get_piers_info",
        query: {
          auth_key: "{authKey}"
        }
      },
      functions: {
        getPiers: [
          "authKey"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/get_programs_info",
        query: {
          auth_key: "{authKey}"
        }
      },
      functions: {
        getPrograms: [
          "authKey"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/get_cruises_info",
        query: {
          auth_key: "{authKey}",
          program: "{service}",
          start_date: "{start}",
          pier: "{point}"
        }
      },
      functions: {
        getСruises: [
          "authKey",
          "service",
          "start",
          "point"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/request_order",
        query: {
          auth_key: "{authKey}",
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
          "authKey",
          "tickets",
          "tour",
          "tourBack"
        ],
        postOrderOpenTime: [
          "authKey",
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
        url: "http://ntcm.neva.travel:3000/partner_api/get_order_status",
        query: {
          auth_key: "{authKey}",
          order_id: "{order}"
        }
      },
      functions: {
        getOrder: [
          "authKey",
          "order"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/comment_order",
        query: {
          auth_key: "{authKey}",
          order_id: "{order}",
          comment: "{comment}"
        }
      },
      functions: {
        postOrderComment: [
          "authKey",
          "order",
          "comment"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/reject_order",
        query: {
          auth_key: "{authKey}",
          order_id: "{order}",
          require_confirmation: "{requireConfirmation}"
        }
      },
      functions: {
        approveOrder: [
          "authKey",
          "order",
          "requireConfirmation"
        ]
      }
    },
    {
      template: {
        method: "GET",
        url: "http://ntcm.neva.travel:3000/partner_api/reject_order",
        query: {
          auth_key: "{authKey}",
          order_id: "{order}",
          comment: "{comment}"
        }
      },
      functions: {
        rejectOrder: [
          "authKey",
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
