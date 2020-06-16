import {inject} from '@loopback/core';
import {
  get,
  // post,
  put,
  del,
  param,
  // requestBody,
  // HttpErrors,
} from '@loopback/rest';
import {parse, format} from 'date-fns';
import {AstramarinService, StrJSONParam} from './astramarin.service';

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

interface BookStatus {
  BookStatus: 'ОК' | string;
}

interface CancelBookStatus {
  CancelBookStatus: boolean;
}

interface PaymentType {
  PaymentID: string;
  PaymentName: string;
  PaymentConfirm: boolean;
}

export class AstramarinController {
  constructor(
    @inject('services.AstramarinService')
    protected astramarinService: AstramarinService,
  ) {}

  /* 1 */
  @get('/partner/astramarin/category', {
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

  /* 2 */
  @get('/partner/astramarin/category/{category}/services', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getServicesOnDate(
    @param.path.string('category') category: string,
    @param.query.string('dateFrom')
    date: string = format(new Date(), 'dd.MM.yyyy'),
    @param.query.string('dateTo') dateTo?: string,
  ): Promise<ServiceOnDate[]> {
    const dateOutput = date
      ? parse(date, 'dd.MM.yyyy', new Date())
      : new Date();

    const StringJSON = JSON.stringify({
      ServiceGroup_ID: category,
      Date_From: dateOutput,
      Date_To: dateTo && parse(dateTo, 'dd.MM.yyyy', dateOutput),
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getServicesOnDate(<
      StrJSONParam
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Services.StringJSON);
  }

  /* 3 */
  @get('/partner/astramarin/events', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getEventsOnDate(
    @param.query.string('service') service: string,
    @param.query.string('date')
    date: string = format(new Date(), 'dd.MM.yyyy'),
    @param.query.string('category') category?: string,
  ): Promise<EventOnDate[]> {
    const dateOutput = parse(date, 'dd.MM.yyyy', new Date());

    const StringJSON = JSON.stringify({
      Service_ID: service,
      Date: dateOutput,
      ServiceGroup_ID: category,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getEventsOnDate(<
      StrJSONParam
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Event.StringJSON);
  }

  /* 4 */
  @get('/partner/astramarin/places/{place}/category', {
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
      StrJSONParam
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.SeatСategory.StringJSON);
  }

  /* 5 */
  @get('/partner/astramarin/events/{event}/places', {
    responses: {
      '200': {
        description: `Return services on date`,
      },
    },
    summary: `Get services on date`,
  })
  async getSeatsOnEvent(
    @param.path.string('event') event: string,
    @param.query.string('placeCategory') placeCategory?: string,
  ): Promise<Place[]> {
    const StringJSON = JSON.stringify({
      Event_ID: event,
      Category_ID: placeCategory,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getSeatsOnEvent(<
      StrJSONParam
    >{
      StringJSON,
    });

    return JSON.parse(response.result.return.Seats.StringJSON);
  }

  /* 6 */
  @put('/partner/astramarin/events/{event}/places/{place}/booking', {
    responses: {
      '200': {
        description: `Booking place on event`,
      },
    },
    summary: `Booking place on event`,
  })
  async putBookingSeat(
    @param.path.string('event') event: string,
    @param.path.string('place') place: string,
    @param.query.string('session') session: string,
  ): Promise<BookStatus> {
    const StringJSON = JSON.stringify({
      Event_ID: event,
      Seat_ID: place,
      Session_ID: session,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.putBookingSeat(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.Book.StringJSON);
  }

  /* 7 */
  @del('/partner/astramarin/events/{event}/places/{place}/booking', {
    responses: {
      '200': {
        description: `Cancel booking place on event`,
      },
    },
    summary: `Cancel booking place on event`,
  })
  async delBookingSeat(
    @param.path.string('event') event: string,
    @param.path.string('place') place: string,
    @param.query.string('session') session: string,
  ): Promise<CancelBookStatus> {
    const StringJSON = JSON.stringify({
      Event_ID: event,
      Seat_ID: place,
      Session_ID: session,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.delBookingSeat(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.CancelBookingSeat.StringJSON);
  }

  /* 8 Free seating */
  @get('/partner/astramarin/category/{category}/services/{service}/tickets', {
    responses: {
      '200': {
        description: `Return types of tickets`,
      },
    },
    summary: `Get types of tickets`,
  })
  async getTicketType(
    @param.path.string('category') category: string,
    @param.path.string('service') service: string,
  ): Promise<ServiceOnDate[]> {
    const StringJSON = JSON.stringify({
      Service_ID: service,
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getTicketType(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.Services.StringJSON);
  }

  /* 9 */
  @get('/partner/astramarin/payments', {
    responses: {
      '200': {
        description: `Return payment types`,
      },
    },
    summary: `Get payment types`,
  })
  async getPaymentType(): Promise<PaymentType[]> {
    const StringJSON = JSON.stringify({
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getPaymentType(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.PaymentType.StringJSON);
  }

  /* 10 Free seating */
  @get('/partner/astramarin/events/{event}/tickets/{tickets}/price', {
    responses: {
      '200': {
        description: `Cancel booking place on event`,
      },
    },
    summary: `Cancel booking place on event`,
  })
  async getSeatPriceOnFreeSeating(
    @param.path.string('event') event: string,
    @param.path.string('place') place: string,
  ): Promise<CancelBookStatus> {
    const StringJSON = JSON.stringify({
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getSeatPrice(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.CancelBookingSeat.StringJSON);
  }

  /* 10 Specific seating */
  @get('/partner/astramarin/events/{event}/tickets/{tickets}/price', {
    responses: {
      '200': {
        description: `Cancel booking place on event`,
      },
    },
    summary: `Cancel booking place on event`,
  })
  async getSeatPriceOnSpecificSeating(
    @param.path.string('event') event: string,
    @param.path.string('place') place: string,
  ): Promise<CancelBookStatus> {
    const StringJSON = JSON.stringify({
      Email: 'info@nevatrip.ru',
    });

    const response = await this.astramarinService.getSeatPrice(<StrJSONParam>{
      StringJSON,
    });

    return JSON.parse(response.result.return.CancelBookingSeat.StringJSON);
  }
}
