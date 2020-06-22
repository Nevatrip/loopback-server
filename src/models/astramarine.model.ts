import {Model, model, property} from '@loopback/repository';

@model()
export class GetServicesRequest extends Model {
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

  @property({
    type: 'string',
    description: 'Адрес электронной почты авторизованного пользователя. Необходим для ведения логов. При наличии обязателен для передачи'
  })
  email?: string;

  constructor(data?: Partial<GetServicesRequest>) {
    super(data);
  }
}

@model()
class Service extends Model {
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

  constructor(data?: Partial<GetServicesRequest>) {
    super(data);
  }
}

@model()
export class GetServicesResponse extends Model {
  @property.array( Service )
  services: Service[];

  constructor(data?: Partial<GetServicesRequest>) {
    super(data);
  }
}
