import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AstramarineDataSource} from '../datasources';
import { GetServicesResponse, GetEventsResponse, GetSeatCategoriesResponse, GetSeatsOnEventResponse } from '../models';

interface IGetServicesRequest {
  dateFrom?: string
  dateTo?: string
}

interface IGetEventsRequest {
  dateFrom?: string
  dateTo?: string
}

interface IGetSeatCategoriesRequest {
  dateFrom?: string
  dateTo?: string
}

interface IGetSeatsOnEventRequest {
  dateFrom?: string
  dateTo?: string
}

export interface AstramarineService {
  getServices( body: IGetServicesRequest ): Promise<GetServicesResponse>;
  getEvents( body: IGetEventsRequest ): Promise<GetEventsResponse>;
  getSeatCategories( body: IGetSeatCategoriesRequest ): Promise<GetSeatCategoriesResponse>;
  getSeatsOnEvent( body: IGetSeatsOnEventRequest ): Promise<GetSeatsOnEventResponse>;
}

export class AstramarineProvider implements Provider<AstramarineService> {
  constructor(
    // astramarine must match the name property in the datasource json file
    @inject('datasources.astramarine')
    protected dataSource: AstramarineDataSource = new AstramarineDataSource(),
  ) {}

  value(): Promise<AstramarineService> {
    return getService(this.dataSource);
  }
}
