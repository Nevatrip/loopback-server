import {inject} from '@loopback/core';
import {
  get,
  // post,
  // put,
  // del,
  param,
  // requestBody,
  HttpErrors,
} from '@loopback/rest';
import {parse} from 'date-fns';
import {
  AstramarinService,
  StringJSONParameter,
} from '../services/astramarin.service';

interface ServiceGroup {
  ServiceGroupID: string;
  ServiceGroupName: string;
}

interface ServiceOnDate {
  Name: string;
  ID: string;
  NoSeat: boolean;
  NoCategory: boolean;
  ComboIn: boolean;
  TypeOfService: string;
  StatusRequestBuyer: boolean;
  FormingBarCode: boolean;
}

interface EventOnDate {
  Service_ID: string;
  Date: string;
  ServiceGroup_ID: string;
  Email: string;
  Event_ID: string;
}

interface SeatCategory {
  CategoryID: string;
  CategoryName: string;
}

interface Place {
  VenueName: string;
  SeatID: string;
  Status: string;
  VenueID: string;
  CategorySeatName: string;
  CategorySeatID: string;
  NumberOfSeats: number;
  PierName: string;
  Prices: {
    PriceName: string;
    Price: number;
  }[];
}

export class AstramarinController {
  constructor(
    @inject('services.AstramarinService')
    protected astramarinService: AstramarinService,
  ) {}

  @get('/partner/astramarin/serviceGroups', {
    responses: {
      '200': {
        description: `Return service groups`,
      },
    },
    summary: `Get services groups`,
  })
  async getServiceGroups(): Promise<ServiceGroup[]> {
    const response = await this.astramarinService.getServiceGroups();

    return JSON.parse(response.result.return.ServiceType.StringJSON);
  }

  @get('/partner/astramarin/serviceGroups/{serviceGroup}', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getServicesOnDate(
    @param.path.string('serviceGroup') serviceGroup: string,
    @param.query.string('dateFrom') date?: string,
    @param.query.string('dateTo') dateTo?: string,
  ): Promise<ServiceOnDate[]> {
    const dateOutput = date
      ? parse(date, 'dd.MM.yyyy', new Date())
      : new Date();

    const StringJSON = JSON.stringify({
      ServiceGroup_ID: serviceGroup,
      Date_From: dateOutput,
      Date_To: dateTo && parse(dateTo, 'dd.MM.yyyy', dateOutput),
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getServicesOnDate(<
      StringJSONParameter
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Services.StringJSON);
  }

  @get('/partner/astramarin/service/{service}', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getEventsOnDate(
    @param.path.string('service') service: string,
    @param.query.string('date') date: string,
    @param.query.string('serviceGroup') serviceGroup?: string,
  ): Promise<EventOnDate[]> {
    if (!date) {
      throw new HttpErrors.BadRequest(`Date is not defined`);
    }

    const dateOutput = parse(date, 'dd.MM.yyyy', new Date());

    const StringJSON = JSON.stringify({
      Service_ID: service,
      Date: dateOutput,
      ServiceGroup_ID: serviceGroup,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getEventsOnDate(<
      StringJSONParameter
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Event.StringJSON);
  }

  @get('/partner/astramarin/place/{place}/seatCategory', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getSeatСategory(
    @param.path.string('place') place: string,
  ): Promise<SeatCategory[]> {
    const StringJSON = JSON.stringify({
      Venue_ID: place,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getSeatСategory(<
      StringJSONParameter
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.SeatСategory.StringJSON);
  }

  @get('/partner/astramarin/event/{event}/places', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getSeatsOnEvent(
    @param.path.string('event') event: string,
    @param.query.string('category') category?: string,
  ): Promise<Place[]> {
    const StringJSON = JSON.stringify({
      Event_ID: event,
      Category_ID: category,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getSeatsOnEvent(<
      StringJSONParameter
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Seats.StringJSON);
  }
}
