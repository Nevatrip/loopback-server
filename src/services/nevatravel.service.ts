import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {NevatravelDataSource} from '../datasources';
import { NevatravelTickets, NevatravelStatus, NevatravelPier, NevatravelProgram, NevatravelCruise } from '../models';

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
  getStatus(): Promise<NevatravelStatus>;
  getPiers(): Promise<NevatravelPier>[];
  getPrograms(): Promise<NevatravelProgram>[];
  getСruises(
    service: number,
    start: string,
    point?: number,
  ): Promise<NevatravelCruise>[];
  postOrderFixedTime(
    tickets: NevatravelTickets,
    tour: number,
    tourBack?: number,
  ): Promise<NevatravelOrderPost>;
  postOrderOpenTime(
    tickets: NevatravelTickets,
    date: string,
    point: number,
    service: number,
    serviceBack?: number,
  ): Promise<NevatravelOrderPost>;
  getOrder(
    order: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  postOrderComment(
    order: string,
    comment: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  approveOrder(
    order: string,
    requireConfirmation: boolean,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
  rejectOrder(
    order: string,
    comment: string,
  ): Promise<NevatravelOrderGet | ErrorMessage>;
}

export class NevatravelProvider implements Provider<NevatravelService> {
  constructor(
    // nevatravel must match the name property in the datasource json file
    @inject('datasources.nevatravel')
    protected dataSource: NevatravelDataSource = new NevatravelDataSource(),
  ) {}

  value(): Promise<NevatravelService> {
    return getService(this.dataSource);
  }
}
