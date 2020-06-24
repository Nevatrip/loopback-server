import {Model, model, property} from '@loopback/repository';

class Request extends Model {
  @property({
    type: 'string',
    description: 'Адрес электронной почты авторизованного пользователя. Необходим для ведения логов. При наличии обязателен для передачи'
  })
  email?: string;

  constructor(data?: Partial<Request>) {
    super(data);
  }
}

@model()
export class GetServicesRequest extends Request {
  @property({
    type: 'string',
    default: new Date().toISOString(),
    description: 'Начало периода. В случае отсутствия равен текущей дате'
  })
  dateFrom?: string;

  @property({
    type: 'string',
    default: new Date().toISOString(),
    description: 'Конец периода. В случае отсутствия равен концу года'
  })
  dateTo?: string;

  constructor(data?: Partial<GetServicesRequest>) {
    super(data);
  }
}

@model()
export class Service extends Model {
  @property({
    type: 'string',
    description: 'Идентификатор услуги'
  })
  serviceID: string;

  @property({
    type: 'string',
    description: 'Наименование услуги'
  })
  serviceName: string;

  @property({
    type: 'boolean',
    description: 'Без мест. Признак того, что для данной услуги не предусмотрена схема рассадки. Следовательно при использовании методов с входящими параметрами seatCategoryID, seatID таких как getSeatPrices, registerOrder, не нужно передавать параметры  seatCategoryID, seatID'
  })
  serviceNoSeats: boolean;

  @property({
    type: 'string',
    description: 'Тип услуги. Может принимать следующие значения: DateTimeSeat, DateTime, Date, Place. Определяет ветку алгоритма продажи'
  })
  serviceType: 'DateTimeSeat' | 'DateTime' | 'Date' | 'Place';

  @property({
    type: 'boolean',
    description: 'Показывает необходимость запроса у покупателя статуса «Резидент», «Не резидент». Если параметр принимает значение true, то при использовании методов с входящим параметром  «resident», таких как getSeatPrices, registerOrder, необходимо передать значение параметра «resident»'
  })
  statusRequestBuyer: boolean;

  @property({
    type: 'boolean',
    description: 'Показывает, что при формировании продажи штрих-коды не формируются'
  })
  formingBarCode: boolean;

  @property({
    type: 'number',
    description: 'Продолжительность в минутах'
  })
  serviceDuration: number;

  constructor(data?: Partial<Service>) {
    super(data);
  }
}

@model()
export class GetServicesResponse extends Model {
  @property.array( Service )
  services: Service[];

  constructor(data?: Partial<GetServicesResponse>) {
    super(data);
  }
}

@model()
export class GetEventsRequest extends Request {
  @property({
    type: 'string',
    default: new Date().toISOString(),
    description: 'Дата начала запрашиваемого периода'
  })
  dateFrom?: string;

  @property({
    type: 'string',
    default: new Date().toISOString(),
    description: 'Дата окончания запрашиваемого периода'
  })
  dateTo?: string;

  @property({
    type: 'string',
    description: 'Идентификатор услуги. Устанавливает отбор по услуге'
  })
  serviceID?: string;

  @property({
    type: 'string',
    description: 'Идентификатор мероприятия. Устанавливает отбор по мероприятию'
  })
  eventID?: string;

  constructor(data?: Partial<GetEventsRequest>) {
    super(data);
  }
}

@model()
export class Event extends Model {
  @property({
    type: 'string',
    description: 'Идентификатор мероприятия'
  })
  eventID: string

  @property({
    type: 'string',
    description: 'Наименование мероприятия'
  })
  eventName: string

  @property({
    type: 'string',
    description: 'Дата и время мероприятия. (Для типов услуг Date, Place может принимать значения: Дата и Пусто соответственно)'
  })
  eventDateTime: string

  @property({
    type: 'string',
    description: 'Идентификатор услуги'
  })
  serviceID: string

  @property({
    type: 'string',
    description: 'Наименование услуги'
  })
  serviceName: string

  @property({
    type: 'string',
    description: 'Идентификатор площадки'
  })
  venueID: string

  @property({
    type: 'string',
    description: 'Наименование площадки'
  })
  venueName: string

  @property({
    type: 'boolean',
    description: 'Свободная рассадка. Признак того, что для данного мероприятия не предусмотрена рассадка по местам. Следовательно при использовании методов с входящим параметром seatID, таких как getSeatPrices, registerOrder, не нужно передавать параметры seatID. Но необходимо передать параметр seatCategoryID'
  })
  eventFreeSeating: boolean

  @property({
    type: 'boolean',
    description: 'Без мест. Признак того, что для данного мероприятия не предусмотрена схема рассадки. Следовательно при использовании методов с входящими параметрами seatCategoryID, seatID таких как getSeatPrices, registerOrder, не нужно передавать параметры  seatCategoryID, seatID'
  })
  eventNoSeats: boolean

  @property({
    type: 'string',
    description: 'Наименование группы услуг'
  })
  ServiceGroupName: string

  @property({
    type: 'string',
    description: 'Идентификатор места отправления (Места проведения)'
  })
  pierID: string

  @property({
    type: 'string',
    description: 'Наименование места отправления (Места проведения)'
  })
  pierName: string

  @property({
    type: 'number',
    description: 'Продолжительность мероприятия в минутах'
  })
  eventDuration: number

  @property({
    type: 'boolean',
    description: 'Показывает необходимость запроса у покупателя статуса «Резидент», «Не резидент». Если параметр принимает значение true, то при использовании методов с входящим параметром  «resident», таких как getSeatPrices, registerOrder, необходимо передать значение параметра «resident»'
  })
  statusRequestBuyer: boolean

  @property({
    type: 'boolean',
    description: 'Определяет необходимость запрос мест по мероприятию (вызов метода seatsOnEvent) - true – вызываем, false – не вызываем'
  })
  eventQuantityLimit: boolean

  constructor(data?: Partial<Event>) {
    super(data);
  }
}

@model()
export class GetEventsResponse extends Model {
  @property.array( Event )
  events: Event[];

  constructor(data?: Partial<GetEventsResponse>) {
    super(data);
  }
}

@model()
export class GetSeatCategoriesRequest extends Request {
  @property({
    type: 'string',
    description: 'Идентификатор мероприятия'
  })
  eventID: string;

  constructor(data?: Partial<GetSeatCategoriesRequest>) {
    super(data);
  }
}

@model()
export class SeatCategory extends Model {
  @property({
    type: 'string',
    description: 'Идентификатор группы мест'
  })
  seatCategoryID: string;

  @property({
    type: 'string',
    description: 'Наименование группы мест'
  })
  seatCategoryName: string;

  constructor(data?: Partial<SeatCategory>) {
    super(data);
  }
}

@model()
export class GetSeatCategoriesResponse extends Model {
  @property.array( SeatCategory )
  seatCategories: SeatCategory[];

  constructor(data?: Partial<GetSeatCategoriesResponse>) {
    super(data);
  }
}

@model()
export class GetSeatsOnEventRequest extends Request {
  @property({
    type: 'string',
    description: 'Идентификатор мероприятия'
  })
  eventID: string;

  @property({
    type: 'string',
    description: 'Идентификатор категории мест площадки. Устанавливает отбор по категории мест'
  })
  seatCategoryID: string;

  constructor(data?: Partial<GetSeatsOnEventRequest>) {
    super(data);
  }
}

@model()
export class Seat extends Model {
  @property({
    type: 'string',
    description: 'Идентификатор посадочного места. Пусто если: 1) возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true или 2) возвращаемый параметр eventFreeSeating, метода getEvents, принимает значение true'
  })
  seatID: string;

  @property({
    type: 'string',
    description: 'Псевдоним места. Пусто если: 1) возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true или 2) возвращаемый параметр eventFreeSeating, метода getEvents, принимает значение true'
  })
  aliasSeat: string;

  @property({
    type: 'string',
    description: 'Статус посадочного места принимает следующие значения: 1) Продано 2) Бронь 3) Выбрано (выбрано другим пользователем) 4) Свободно. Пусто если: 1) возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true или 2) возвращаемый параметр eventFreeSeating, метода getEvents, принимает значение true'
  })
  seatStatus: string;

  @property({
    type: 'string',
    description: 'Наименование категории места. Пусто, если возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true'
  })
  seatCategoryName: string;

  @property({
    type: 'string',
    description: 'Идентификатор категории места. Пусто, если возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true'
  })
  seatCategoryID: string;

  @property({
    type: 'number',
    description: 'Количество посадочных мест на выбранном месте (стол с несколькими посадочными местами). Пусто, если возвращаемый параметр eventNoSeats, метода getEvents, принимает значение true'
  })
  numberOfTicketsPerSeat: number;

  @property({
    type: 'number',
    description: 'Количество свободных мест для продажи'
  })
  availableSeats: number;

  constructor(data?: Partial<Seat>) {
    super(data);
  }
}

@model()
export class GetSeatsOnEventResponse extends Model {
  @property.array( Seat )
  seats: Seat[];

  constructor(data?: Partial<GetSeatsOnEventResponse>) {
    super(data);
  }
}
