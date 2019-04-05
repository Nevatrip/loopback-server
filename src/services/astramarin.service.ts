import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AstramarinDataSource} from '../datasources';

export interface StringJSONParameter {
  StringJSON: string;
}

export interface AstramarinService {
  getServiceGroups(): Promise<SOAPResponse>;
  getServicesOnDate(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getEventsOnDate(StringJSON: StringJSONParameter): Promise<SOAPResponse>;

  getSeatСategory(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getSeatsOnEvent(StringJSON: StringJSONParameter): Promise<SOAPResponse>;

  putBookingSeat(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  delBookingSeat(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getPaymentType(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getSeatPrice(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getMenuOnTypePrice(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getPromoCode(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  postSaleSeat(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  putPayment(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  checkDeposit(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getDepositOnDate(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  delOrder(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
  getDiscountCard(StringJSON: StringJSONParameter): Promise<SOAPResponse>;
}

export class AstramarinServiceProvider implements Provider<AstramarinService> {
  constructor(
    @inject('datasources.astramarin')
    protected dataSource: juggler.DataSource = new AstramarinDataSource(),
  ) {}

  value(): Promise<AstramarinService> {
    return getService(this.dataSource);
  }
}

interface SOAPResponse {
  result: {
    return: {
      [node: string]: {
        StringJSON: string;
      };
    };
  };
}
