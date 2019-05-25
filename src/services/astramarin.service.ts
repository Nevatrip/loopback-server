import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AstramarinDataSource} from '../datasources';

export interface StrJSONParam {
  StringJSON: string;
}

export interface AstramarinService {
  /*  1 */ getServiceGroups(): Promise<SOAPResp>;
  /*  2 */ getServicesOnDate(body: StrJSONParam): Promise<SOAPResp>;
  /*  3 */ getEventsOnDate(body: StrJSONParam): Promise<SOAPResp>;
  /*  4 */ getSeatСategory(body: StrJSONParam): Promise<SOAPResp>;
  /*  5 */ getSeatsOnEvent(body: StrJSONParam): Promise<SOAPResp>;
  /*  6 */ putBookingSeat(body: StrJSONParam): Promise<SOAPResp>;
  /*  7 */ delBookingSeat(body: StrJSONParam): Promise<SOAPResp>;
  /*  8 */ getTicketType(body: StrJSONParam): Promise<SOAPResp>;
  /*  9 */ getPaymentType(body: StrJSONParam): Promise<SOAPResp>;
  /* 10 */ getSeatPrice(body: StrJSONParam): Promise<SOAPResp>;
  /* 11 */ getMenuOnTypePrice(body: StrJSONParam): Promise<SOAPResp>;
  /* 12 */ getPromoCode(body: StrJSONParam): Promise<SOAPResp>;
  /* 13 */ postSaleSeat(body: StrJSONParam): Promise<SOAPResp>;
  /* 14 */ putPayment(body: StrJSONParam): Promise<SOAPResp>;
  /* 15 */ checkDeposit(body: StrJSONParam): Promise<SOAPResp>;
  /* 16 */ getDepositOnDate(body: StrJSONParam): Promise<SOAPResp>;
  /* 17 */ delOrder(body: StrJSONParam): Promise<SOAPResp>;
  /* 18 */ getDiscountCard(body: StrJSONParam): Promise<SOAPResp>;
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

interface SOAPResp {
  result: {
    return: {
      [node: string]: {
        StringJSON: string;
      };
    };
  };
}
