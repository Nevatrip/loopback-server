import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {NevatravelDataSource} from './nevatravel.datasource';
import {
  NevatravelStatus,
  NevatravelPier,
  NevatravelProgram,
  NevatravelCruise,
  NevatravelTickets,
} from './nevatravel.model';

export interface NevatravelOrderPost {
  status?: string;
  message?: string;
  ticket_token: string;
  back_ticket_token?: string;
  ticket_total_price: string;
  back_ticket_total_price?: string;
  tickets_price?: NevatravelTickets;
  back_tickets_price?: NevatravelTickets;
}

export interface NevatravelOrderGet {
  id: string;
  user_id: string;
  cashbox_id: string;
  cruise_id: string;
  created_at: Date;
  updated_at: Date;
  period_id: string;
  state: string;
  number: string;
  confirmed_or_rejected_by_id: string;
  confirmed_or_rejected_at?: Date | null;
  partner_id: string;
  email?: string | null;
  order_id: string;
  open_time_order_id: string;
  name?: string | null;
  phone?: string | null;
  print_count: number;
  cruise_version: number;
  back_cruise?: string | null;
  special: boolean;
  cashless: boolean;
  sms_number?: string | null;
  send_sms: boolean;
  hide_ticket_price: boolean;
}

export interface ErrorMessage {
  status: 'fail';
  message: string;
}

export interface NevatravelService {
  getStatus(authKey: string): Promise<NevatravelStatus>;
  getPiers(authKey: string): Promise<NevatravelPier>[];
  getPrograms(authKey: string): Promise<NevatravelProgram>[];
  getСruises(
    authKey: string,
    service: number,
    start: string,
    point?: number,
  ): Promise<NevatravelCruise>[];
  postOrderFixedTime(
    authKey: string,
    tickets: NevatravelTickets,
    tour: number,
    tourBack?: number,
  ): Promise<NevatravelOrderPost>;
  postOrderOpenTime(
    authKey: string,
    tickets: NevatravelTickets,
    date: string,
    point: number,
    service: number,
    serviceBack?: number,
  ): Promise<NevatravelOrderPost>;
  getOrder(
    authKey: string,
    order: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  postOrderComment(
    authKey: string,
    order: string,
    comment: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  approveOrder(
    authKey: string,
    order: string,
    requireConfirmation: boolean,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  rejectOrder(
    authKey: string,
    order: string,
    comment: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
}

export class NevatravelServiceProvider implements Provider<NevatravelService> {
  constructor(
    @inject('datasources.nevatravel')
    protected dataSource: juggler.DataSource = new NevatravelDataSource(),
  ) {}

  value(): Promise<NevatravelService> {
    return getService(this.dataSource);
  }
}
