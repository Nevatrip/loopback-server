import {Order, IAction} from '../models';
import {PaymentSuccessResponse} from 'cloudpayments';
import {createTransport} from 'nodemailer';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {renderEmail} from '../utils/renderEmail';

const SMTPUser = process.env.SMTP_USER;
const SMTPPass = process.env.SMTP_PASS;

type Status = 'new' | 'paid' | 'rejected' | 'manager';

let number = '¯\\_(ツ)_/¯';
let title = 'Название экскурсии';

const getMailContent = (order: Order, status: Status) => {
  const {
    user: {
      fullName,
      // phone,
      email,
    },
    products,
    payment,
  } = order;

  let event: IAction = {
    _key: '',
    start: new Date(),
  };

  let passengerCount = 0;

  const productList = products.map(({product, options}) => {
    if (!product || !options) return;

    let [
      {direction, tickets, event: optionsEvent, number: optionsNumber},
    ] = options;

    event = optionsEvent;
    title = product.title.ru.name;
    if (optionsNumber) number = optionsNumber;

    const productDirection = product.directions.find(
      dir => direction === dir._key,
    );

    if (!productDirection || productDirection._type !== 'direction') return;

    return productDirection.tickets.reduce(
      (render, {_key, name /* , price */}) => {
        if (tickets.hasOwnProperty(_key) && tickets[_key]) {
          switch (status) {
            case 'manager':
              render += `<b>${name}</b>: ${tickets[_key]}<br/>`;
              passengerCount += tickets[_key];
              break;
            default:
              render += `
              ${name} /
              <font style="color:#486482;font-size:19.2px">
                ${name === 'Взрослый' ? 'Adult' : 'Pre-school'}
              </font>
              — ${tickets[_key]} шт.
              <br>
            `;
              break;
          }
        }

        return render;
      },
      '',
    );
  });

  const date: Date = new Date(event.start);
  // TODO timezone offset
  date.setMinutes(date.getMinutes() + 180);
  const prevDate: Date = new Date(date);
  prevDate.setHours(prevDate.getHours() - 24);

  const dateFormat = {
    ru: format(date, 'dd.MM.yyyy', {locale: ru}),
    en: format(date, 'yyyy-MM-dd'),
  };

  const prevDateFormat = {
    ru: format(prevDate, 'dd.MM.yyyy', {locale: ru}),
    en: format(prevDate, 'yyyy-MM-dd'),
  };

  const content = {
    new: `<h3>Новый заказ для ${fullName}</h3>
      <p>Товары:</p>
      <ul>${productList}</ul>
      <p>Сумма: ${(payment as PaymentSuccessResponse).Model.Amount} ₽</p>
      <p>Ссылка на оплату: ${
        (payment as PaymentSuccessResponse).Model.Status
      }</p>
      <p>Ваш email: ${email}</p>`,
    paid: renderEmail({
      page: 'email',
      api: order,
    }),
    rejected: `Заказ отменён`,
    manager: `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif"><tbody><tr><td align="center" valign="top">
      <h3>Заявка на бронирование билетов</h3><table width="622" cellpadding="5" cellspacing="5" style="border:1px solid #dadada;"><tbody>
      <tr><th width="200" style="text-align: right;">№ Договора:</th><td>ООО "Про Событие"</td></tr>
      <tr><th style="text-align: right;">Название компании:</th><td>«Неватрип»</td></tr>
      <tr><th style="text-align: right;">Контактное лицо:</th><td>Команда Неватрип</td></tr>
      <tr><th style="text-align: right;">Контактный телефон:</th><td>89219653404</td></tr>
      <tr><th style="text-align: right;">Контактный E-mail:</th><td>order@nevatrip.ru</td></tr></tbody></table>
      <h3>Просим Вас забронировать билеты на прогулку:</h3><table width="622" cellpadding="5" cellspacing="5" style="border:1px solid #dadada;"><tbody>
      <tr><th style="text-align: right;" width="200">Дата:</th><td>в ночь с ${prevDateFormat.ru} на ${dateFormat.ru}</td></tr>
      <tr><th style="text-align: right;">Время:</th><td>00:20</td></tr>
      <tr><th style="text-align: right;" valign="top">Причал отправления:</th><td valign="top">Кронверкская набережная. Иоанновский мост</td></tr>
      <tr><th style="text-align: right;">Название рейса:</th><td>Визит в ночную крепость - ждем подтверждения</td></tr>
      <tr><th style="text-align: right;">№ Ваучера:</th><td>НТ${number}</td></tr>
      <tr><th style="text-align: right;">ФИО Клиента:</th><td>${fullName}</td></tr>
      <tr><th style="text-align: right;">Количество туристов:</th><td>${passengerCount}</td></tr></tbody></table>
      <h3>Из них:</h3><table width="622" cellpadding="5" cellspacing="5" style="border:1px solid #dadada;"><tbody><tr><td width="50%" valign="top">
      ${productList}</td></tr></tbody></table></td></tr></tbody></table><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
    `,
  };

  return content[status];
};

export const sendEmail = (order: Order, status: Status) => {
  const {
    user: {email},
  } = order;

  const transporter = createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: SMTPUser,
      pass: SMTPPass,
    },
  });

  const mailContent = getMailContent(order, status);

  const mailOptions = {
    from: '"NevaTrip" <order@nevatrip.ru>', // sender address
    html: mailContent,
    to:
      status === 'manager'
        ? ['info@nevatrip.ru', 'order@nevatrip.ru', 'driver-spb@yandex.ru']
        : email, // list of receivers
    subject: `Заказ билетов на «${title}» НТ${number}`,
    text: JSON.stringify(order), // plain text body
  };

  transporter.sendMail(
    mailOptions,
    // tslint:disable-next-line: no-any
    (error: any, info: {messageId: any; response: any}) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    },
  );
};
