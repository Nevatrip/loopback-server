import {Order, IAction} from '../models';
import {PaymentSuccessResponse} from 'cloudpayments';
import {createTransport} from 'nodemailer';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

const SMTPUser = process.env.SMTP_USER;
const SMTPPass = process.env.SMTP_PASS;

type Status = 'new' | 'paid' | 'rejected' | 'manager';

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
  let number = '¯\\_(ツ)_/¯';

  const productList = products.map(({product, options}) => {
    if (!product || !options) return;

    let tickets = '¯\\_(ツ)_/¯';

    // const productDirection = product.directions.find(
    //   dir => direction && direction.find(item => item._key === dir._key),
    // );
    // if (!productDirection || productDirection._type !== 'direction') return;

    // productDirection.tickets.reduce(
    //   (render, {_key, name /* , price */}) => {
    //     if (tickets.hasOwnProperty(_key) && tickets[_key]) {
    //       switch (status) {
    //         case 'manager':
    //           render += `<b>${name}</b>: ${tickets[_key]}<br/>`;
    //           passengerCount += tickets[_key];
    //           break;
    //         default:
    //           render += `
    //           ${name} /
    //           <font style="color:#486482;font-size:19.2px">
    //             ${name === 'Взрослый' ? 'Adult' : 'Pre-school'}
    //           </font>
    //           — ${tickets[_key]} шт.
    //           <br>
    //         `;
    //           break;
    //       }
    //     }

    //     return render;
    //   },
    //   '',
    // );

    // (productDirection.schedule || []).some(eventItem => {
    //   const action = eventItem.actions.find(actionItem =>
    //     direction.some(dir => dir.action === actionItem),
    //   );
    //   if (action) {
    //     event = action;

    //     return !0;
    //   }
    // });

    return tickets;

    // return `
    //   <li>
    //     <h3>${product.title.ru.name}</h3>
    //     <dl>
    //       <dt>Направление</dt><dd>${options.direction}</dd>
    //       <dt>Причал</dt><dd> WIP </dd>
    //       <dt>Отправление</dt><dd>${options.event}</dd>
    //       <dt>Билеты></dt><dd><ul>${tickets}</ul></dd>
    //     </dl>
    //   </li>
    // `;
  });

  const date: Date = new Date(event.start);
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
    paid: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html lang="ru" xmlns="http://www.w3.org/1999/xhtml" bgcolor="#F3F3F3"
            style="Margin:0;margin:0;padding: 0;font-family:'Arial',sans-serif;max-width:100%;padding:0;width:100%;background:#F3F3F3;">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <!--   <meta name="format-detection" content="telephone=no">
        <meta http-equiv="x-rim-auto-match" content="none"> -->
      </head>
      <body>
        <span style="color:transparent;font-size:0px;text-align:center;display:block;height:0;width:0;overflow:hidden;">&#9972; ВАШ ПОСАДОЧНЫЙ БИЛЕТ / YOUR E-TICKET </span>
        <table bgcolor="#F3F3F3"
              style="Margin:0;margin:0;padding: 0;font-family:'Arial',sans-serif;max-width:100%;padding:0;width:100%;background:#F3F3F3;">
          <style>
            a{
              text-decoration: none;
              color: inherit;
              color: inherit !important;
            }
            @media print{
              body, html{
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
          <tbody>
          <tr>
            <td>
              <center>
                <table width="600" bgcolor="#6999CC"
                      style="Margin:0 auto;margin:0 auto;max-width:100%;width:600px;background:#6999cc;">
                  <tbody bgcolor="#6999CC" style="background: #6999CC">
                  <tr bgcolor="#6999CC" style="background: #6999CC">
                    <td bgcolor="#6999CC" style="background: #6999CC">
                      <center bgcolor="#6999CC" style="background: #6999CC">
                        <table>
                          <tbody>
                          <tr>
                            <td height="4" style="height: 4px;line-height: 4px;">&nbsp;</td>
                          </tr>
                          </tbody>
                        </table>
                        <!--spacer-->

                        <table cellpadding="0" cellspacing="0" border="0" width="570"
                              style="Margin:0 auto;margin:0 auto;max-width:100%;width:570px;">
                          <tbody>
                          <tr>
                            <td>
                              <center>
                                <table width="570" style="width: 570px;">
                                  <tbody>
                                  <tr>
                                    <td width="125" valign="middle" style="width: 125px;vertical-align: middle;">
                                      <a href="https://nevatrip.ru/" target="_blank"
                                        style="Margin: 0; color: #fff !important; font-family: Arial,sans-serif; font-size: 30px; font-weight: 700 !important; line-height: 30px; margin: 0; padding: 0; text-align: left; text-decoration: none !important;">
                                        <img src="https://nevatrip.ru/assets/img/email/nt.png" alt="NevaTrip" width="125"
                                            style="-ms-interpolation-mode: bicubic; border: 0; clear: both; display: block; height: auto; max-width: 100%; outline: 0; text-decoration: none; width: 125px;">
                                      </a>
                                    </td><!--лого-->
                                    <td valign="middle" style="vertical-align: middle;">&nbsp;</td><!--промежуток-->
                                    <td width="125" valign="middle" style="width: 125px;vertical-align: middle;">
                                      <table
                                          style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">
                                        <tr style="padding: 0; text-align: left; vertical-align: top;">
                                          <td
                                              style="Margin: 0; background: 0 0; border: 3px solid #fff; border-collapse: collapse !important; color: #fff; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                            <center style="min-width: 0; width: 100%;">
                                              <a href="[[++site_url]]print?trip=[[+id]]&hash=[[+cps_email:lowercase:md5]]" align="center"
                                                style="Margin: 0; border: 0 solid transparent; border-radius: 0; color: #fff; display: inline-block; font-family: Arial,sans-serif; font-size: 15px; font-weight: 600; line-height: 20px; margin: 0; padding: 9px 3px 8px; text-align: center; text-decoration: none;">
                                                Печать&nbsp;/&nbsp;Print
                                              </a>
                                            </center>
                                          </td>
                                        </tr>
                                      </table>
                                    </td><!--кнопка-->
                                  </tr>
                                  </tbody>
                                </table>
                                <!--шапка содержимое-->

                              </center>
                            </td>
                          </tr>
                          </tbody>
                        </table>
                        <!--шапка-->

                        <table>
                          <tbody>
                          <tr>
                            <td height="4" style="height: 4px;line-height: 4px;">&nbsp;</td>
                          </tr>
                          </tbody>
                        </table>
                        <!--spacer-->

                        <table cellpadding="0" cellspacing="0" border="0" width="570" bgcolor="#FFFFFF"
                              style="Margin:0 auto;margin:0 auto;max-width:100%;width:570px;background:#fff;">
                          <tbody>
                          <tr>
                            <td>
                              <center>
                                <table>
                                  <tbody>
                                  <tr>
                                    <td height="8" style="height: 8px;line-height: 8px;">&nbsp;</td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--spacer-->

                                <table width="540" style="Margin:0 auto;margin:0 auto;max-width:100%;width:540px;">
                                  <tbody>
                                  <tr>
                                    <td>
                                      <center cellpadding="0" cellspacing="0" border="0">
                                        <p align="center"
                                          style="Margin: 0; Margin-bottom: 0; color: #a5a5a5; font-family: Arial,sans-serif; font-size: 23px; font-weight: 400; letter-spacing: .5px !important; line-height: 26px; margin: 0 !important; margin-bottom: 0; padding: 0; text-align: center; text-transform: none;">
                                          Посадочный билет /
                                          <span style="color:#486482;display:inline-block;font-size:.8em;" >Your E-ticket</span>
                                        </p>
                                        <!--посадочный билет-->

                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->

                                        <h1 align="center" style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 50px !important; font-weight: 700 !important; letter-spacing: .8px !important; line-height: 50px; margin: 0; margin-bottom: 0; padding: 0; text-align: center; text-transform: uppercase !important;">
                                          НТ<a style="Margin: 0; color: #252929; cursor: text; font-family: Arial,sans-serif; font-weight: 400; line-height: 20px; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font style="text-decoration: none; color: #252929;font-weight: bold">${number}</font></a>
                                        </h1>
                                        <!--номер билета 1 штука-->

                                        <!--<table>
                                          <tbody>
                                          <tr>
                                            <td height="10" style="height: 10px;line-height: 10px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        spacer-->

                                        <h2 align="center"
                                            style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 30px; font-weight: 400 !important; line-height: 32px; margin: 0; margin-bottom: 0; padding: 0; text-align: center; word-wrap: normal;">
                                          <a href="https://nevatrip.ru/night/ekskursiya-petropavlovskaya-krepost-i-razvod-mostov"
                                            style="Margin: 0; color: #252929; font-family: Arial,sans-serif; font-weight: 400; line-height: 20px; margin: 0; padding: 0; text-decoration: underline;">
                                            <font style="color: #252929; font-size: 30px; font-weight: 400 !important; line-height: 32px; margin: 0;">
                                              Петропавловская крепость: экскурсия ночью и развод мостов на теплоходе
                                            </font>
                                          </a>
                                        </h2>
                                        <!--название экскурсии длинное-->

                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="7" style="height: 7px;line-height: 7px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                      </center>
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--посадочный билет, номер билета, название экскурсии-->

                                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                      style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top;">
                                  <tbody>
                                  <tr style="padding: 0; text-align: left; vertical-align: top;">
                                    <td
                                        style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                      <img class="separator" src="https://nevatrip.ru/assets/img/email/separator_lg.png"
                                          alt="- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - "
                                          style="-ms-interpolation-mode: bicubic; clear: both; display: block; height: auto; max-width: 100%; outline: 0; text-align: center; text-decoration: none; width: 100%;">
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--пунктир-->
                                <table cellpadding="0" cellspacing="0" border="0" width="540"
                                      style="Margin:0 auto;margin:0 auto;max-width:100%;width:540px;">
                                  <tbody>
                                  <tr>
                                    <td>
                                      <table cellpadding="0" cellspacing="0" border="0"
                                            style="border-collapse: collapse; border-spacing: 0; display: inline-block; padding: 0; text-align: left; vertical-align: top; width: auto;">
                                        <tbody>
                                        <tr style="padding: 0; text-align: left; vertical-align: top;">
                                          <td style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                            <p style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 22px; font-weight: 400; line-height: 22px !important; margin: 0; margin-bottom: 0; padding: 0; text-align: left; text-transform: lowercase; padding-right: 20px;">
                                              дата&nbsp;/&nbsp;<font style="color:#486482;font-size:17.6px">date</font>
                                            </p>
                                            <p style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 27px; font-weight: 700; line-height: 33px; margin: 0; margin-bottom: 0; padding: 0; text-align: left; padding-right: 20px;">
                                              в ночь с ${
                                                prevDateFormat.ru
                                              } на ${dateFormat.ru}
                                              <br />
                                              <font style="color:#486482;font-size:21.6px">on the night from ${
                                                prevDateFormat.en
                                              } to ${dateFormat.en}</font>
                                            </p>
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                          </td>
                                        </tr>
                                        </tbody>
                                      </table>
                                      <!--дата-->
                                      <table cellpadding="0" cellspacing="0" border="0"
                                            style="border-collapse: collapse; border-spacing: 0; display: inline-block; padding: 0; text-align: left; vertical-align: top; width: auto;">
                                        <tbody>
                                        <tr style="padding: 0; text-align: left; vertical-align: top;">
                                          <td
                                              style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                            <p style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 22px; font-weight: 400; line-height: 22px !important; margin: 0; margin-bottom: 0; padding: 0; text-align: left; text-transform: lowercase; padding-right: 20px;">
                                              время&nbsp;/&nbsp;<font style="color:#486482;font-size:17.6px">time</font>
                                            </p>
                                            <p style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 27px; font-weight: 700; line-height: 33px; margin: 0; margin-bottom: 0; padding: 0; text-align: left; padding-right: 20px;">
                                              00:20
                                            </p>
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                          </td>
                                        </tr>
                                        </tbody>
                                      </table>
                                      <!--время-->
                                      <table cellpadding="0" cellspacing="0" border="0"
                                            style="border-collapse: collapse; border-spacing: 0; display: inline-block; padding: 0; text-align: left; vertical-align: top; width: auto;">
                                        <tbody>
                                        <tr style="padding: 0; text-align: left; vertical-align: top;">
                                          <td
                                              style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                            <p
                                                style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 22px; font-weight: 400; line-height: 22px !important; margin: 0; margin-bottom: 0; padding: 0; text-align: left; text-transform: lowercase; padding-right: 20px;">
                                              причал&nbsp;/&nbsp;<font style="color:#486482;font-size:17.6px">place of departure</font>
                                            </p>
                                            <p
                                                style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 27px; font-weight: 700; line-height: 33px; margin: 0; margin-bottom: 0; padding: 0; text-align: left; padding-right: 20px;">
                                              <a href="https://yandex.ru/maps/2/saint-petersburg/?ll=30.322515%2C59.952347&mode=whatshere&source=serp_navig&whatshere%5Bpoint%5D=30.322542%2C59.952359&whatshere%5Bzoom%5D=18&z=18"
                                                style="Margin: 0; color: #252929; font-family: Arial,sans-serif; font-weight: 400; line-height: 20px; margin: 0; padding: 0; text-align: left; text-decoration: none;">
                                                <font
                                                    style="color: #252929; font-size: 27px; font-weight: 700; line-height: 33px; margin: 0;">
                                                  Кронверкская набережная. Иоанновский мост
                                                </font>
                                              </a>
                                            </p>
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                          </td>
                                        </tr>
                                        </tbody>
                                      </table>
                                      <!--причал-->
                                      <table
                                          style="border-collapse: collapse; border-spacing: 0; display: inline-block; padding: 0; text-align: left; vertical-align: top; width: auto !important;">
                                        <tbody>
                                        <tr style="padding: 0; text-align: left; vertical-align: top;">
                                          <td
                                              style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                            <p
                                                style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 22px; font-weight: 400; line-height: 22px !important; margin: 0; margin-bottom: 0; padding: 0; padding-right: 20px; text-align: left; text-transform: lowercase;">
                                              билеты&nbsp;/&nbsp;<font style="color:#486482;font-size:17.6px">tickets</font>
                                            </p>
                                            <p style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 24px; font-weight: 400; line-height: 27px; margin: 0; margin-bottom: 0; padding: 0; padding-right: 20px; text-align: left;">
                                              ${productList}
                                            </p>
                                            <table>
                                              <tbody>
                                              <tr>
                                                <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                              </tr>
                                              </tbody>
                                            </table>
                                            <!--spacer-->
                                          </td>
                                        </tr>
                                        </tbody>
                                      </table>
                                      <!--билеты-->
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--дата, время, причал, места, направление, продолжительность, расписание, hr, билеты-->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                      style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top;">
                                  <tbody>
                                  <tr style="padding: 0; text-align: left; vertical-align: top;">
                                    <td
                                        style="Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                      <img class="separator" src="https://nevatrip.ru/assets/img/email/separator_lg.png"
                                          alt="- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - "
                                          style="-ms-interpolation-mode: bicubic; clear: both; display: block; height: auto; max-width: 100%; outline: 0; text-align: center; text-decoration: none; width: 100%;">
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--пунктир-->
                                <table cellpadding="0" cellspacing="0" border="0" width="540"
                                      style="Margin:0 auto;margin:0 auto;max-width:100%;width:540px;">
                                  <tbody>
                                  <tr colspan="3">
                                    <td height="6" style="height: 6px;line-height: 6px;">&nbsp;</td>
                                  </tr><!--spacer-->
                                  <tr>
                                    <td width="20" style="width: 20px;">&nbsp;</td>
                                    <!--левый отступ от восклицательного знака-->

                                    <td width="60" valign="middle" style="width: 60px;vertical-align: middle;">
                                      <img src="https://nevatrip.ru/assets/img/email/ex.png" alt="!&nbsp;"
                                          style="vertical-align:middle;-ms-interpolation-mode: bicubic; clear: both; color: #6999cc; display: block; float: left; font-size: 150px; font-weight: 700; height: auto; line-height: 150px; max-width: 100%; outline: 0; text-align: left; text-decoration: none; width: auto;">
                                    </td>
                                    <!--восклицательный знак-->
                                    <td valign="middle" style="vertical-align: middle">
                                      <p style="Margin: 0; Margin-bottom: 0; color: #252929; font-family: Arial,sans-serif; font-size: 17px; font-weight: 400; line-height: 23px !important; margin: 0; margin-bottom: 0; padding: 0; text-align: left;">
                                        Билет распечатывать не обязательно, зарегистрируйтесь на рейс перед посадкой, сообщив № электронного билета кассиру, и получите посадочный билет. Вам необходимо подойти за 15-20 минут до отправления рейса (в выходные для метеоров — заранее)
                                      </p>
                                    </td>
                                    <!--инфо текст-->
                                  </tr>
                                  <!--инфо-->
                                  <tr colspan="3">
                                    <td height="16" style="height: 16px;line-height: 16px;">&nbsp;</td>
                                  </tr><!--spacer-->
                                  <tr>
                                    <td valign="middle" colspan="3" style="text-align: center;text-align: center!important;">
                                      <a width="540" style="display:block" href="https://yandex.ru/maps/2/saint-petersburg/?ll=30.322515%2C59.952347&mode=whatshere&source=serp_navig&whatshere%5Bpoint%5D=30.322542%2C59.952359&whatshere%5Bzoom%5D=18&z=18">
                                        <img width="540" src="https://nevatrip.ru/assets/img/e_from_photo/petropavlovskay.jpg"
                                            alt="Причал на карте"
                                            style="-ms-interpolation-mode: bicubic; display: inline-block; height: auto; max-width: 100%; outline: 0; text-decoration: none; width: 540px !important;">
                                      </a>
                                      <center>
                                        <a style="font-size: 19px;text-decoration: underline!important;color: #6999cc!important; margin: 0; line-height:23px;;text-align: center;" href="https://yandex.ru/maps/2/saint-petersburg/?ll=30.322515%2C59.952347&mode=whatshere&source=serp_navig&whatshere%5Bpoint%5D=30.322542%2C59.952359&whatshere%5Bzoom%5D=18&z=18">
                                          Открыть на яндекс карте <br />
                                          <font style="color:#486482;font-size:15.2px;line-height:18.4px">Open map on Yandex</font>
                                        </a>
                                      </center>
                                    </td>
                                  </tr><!--фото причала-->
                                  </tbody>
                                </table>
                                <!--инфо, фото причала-->
                                <table>
                                  <tbody>
                                  <tr>
                                    <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--spacer-->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                      style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top;">
                                  <tbody>
                                  <tr style="padding: 0; text-align: left; vertical-align: top;">
                                    <td
                                        style=" Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                      <img class="separator" src="https://nevatrip.ru/assets/img/email/separator_lg.png"
                                          alt="- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - "
                                          style="-ms-interpolation-mode: bicubic; clear: both; display: block; height: auto; max-width: 100%; outline: 0; text-align: center; text-decoration: none; width: 100%;">
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--пунктир-->
                                <table>
                                  <tbody>
                                  <tr>
                                    <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--spacer-->
                                <table cellpadding="0" cellspacing="0" border="0" width="540"
                                      style="Margin:0 auto;margin:0 auto;max-width:100%;width:540px;">
                                  <tbody>
                                  <tr>
                                    <td valign="middle" style="text-align: center;text-align: center!important;">
                                      <center>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                        <p align="center"
                                          style="Margin: 0; Margin-bottom: 0; color: #000000; font-family: Arial,sans-serif; font-size: 30px !important; font-weight: 400; line-height: 32px!important; margin: 0; margin-bottom: 0; padding: 0; text-align: center;">
                                          Ваш промокод на скидку</br>
                                          5% на другую прогулку!
                                          <br />
                                          <font style="color:#486482;font-size:24px;line-height:25.6px">
                                            Your 5% discount for the next tour!
                                          </font>
                                        </p>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="10" style="height: 10px;line-height: 10px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                        <a href="https://nevatrip.ru/skidki-i-akcii" target="_blank" width="179" height="59" align="center" style="display:inline-block;height: 59px; line-height: 59px; width: 179px;text-align:center">
                                          <img width="179" height="59" align="center" src="https://nevatrip.ru/assets/img/email/btn-call-now-blue.png" alt="СПАСИБО" style="-ms-interpolation-mode: bicubic; background: #f8d557; border: 0; border-radius: 59px; clear: both; color: #6890ce; display: inline-block; font-size: 21px; font-weight: 700; height: 59px; line-height: 59px; max-width: 100%; outline: 0; text-align: center; text-decoration: none; vertical-align: middle; width: 179px;">
                                        </a>
                                        <!--СПАСИБО-->
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="10" style="height: 10px;line-height: 10px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                        <p align="center"
                                          style="Margin: 0; Margin-bottom: 0; color: #999999; font-family: Arial,sans-serif; font-size: 14px !important; font-weight: 400; line-height: 22px!important; margin: 0; margin-bottom: 0; padding: 0; text-align: center;">
                                          Для использования скидки по промокоду просто</br>
                                          введите «СПАСИБО» (без кавычек) в форме оплаты</br>
                                          при оформлении бронирования на сайте <a href="[[++site_url]]"
                                                                                  style="Margin: 0; color: #999999; font-family: Arial,sans-serif; font-weight: 400; line-height: 22px!important; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font
                                            class="link" style="color: #999999; text-decoration: underline;">nevatrip.ru</font></a>.</br>
                                          <font style="color:#486482">
                                            To apply the discount enter the promocode</br>
                                            "СПАСИБО" (without quotes) in the reservation form</br>
                                            on the website <a href="[[++site_url]]"
                                                              style="Margin: 0; color: #486482; font-family: Arial,sans-serif; font-weight: 400; line-height: 22px!important; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font
                                              class="link" style="color: #486482; text-decoration: underline;">nevatrip.ru</font></a> or <a href="https://en.nevatrip.ru/"
                                                                                                                                            style="Margin: 0; color: #486482; font-family: Arial,sans-serif; font-weight: 400; line-height: 22px!important; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font
                                              class="link" style="color: #486482; text-decoration: underline;">en.nevatrip.ru</font></a>.
                                          </font>
                                          <br />
                                        </p>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="8" style="height: 8px;line-height: 8px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="10" style="height: 10px;line-height: 10px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                      </center>
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--Ваш промокод-->
                                <table>
                                  <tbody>
                                  <tr>
                                    <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--spacer-->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                      style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top;">
                                  <tbody>
                                  <tr style="padding: 0; text-align: left; vertical-align: top;">
                                    <td
                                        style=" Margin: 0; border-collapse: collapse !important; color: #252929; font-family: Arial,sans-serif; font-size: 15px; font-weight: 400; line-height: 19px; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">
                                      <img class="separator" src="https://nevatrip.ru/assets/img/email/separator_lg.png"
                                          alt="- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - "
                                          style="-ms-interpolation-mode: bicubic; clear: both; display: block; height: auto; max-width: 100%; outline: 0; text-align: center; text-decoration: none; width: 100%;">
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--пунктир-->
                                <table cellpadding="0" cellspacing="0" border="0" width="540"
                                      style="Margin:0 auto;margin:0 auto;max-width:100%;width:540px;">
                                  <tbody>
                                  <tr>
                                    <td valign="middle" style="text-align: center;text-align: center!important;">
                                      <center>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="1" style="height: 1px;line-height: 1px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->
                                        <p align="center"
                                          style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 24px !important; font-weight: 400; line-height: 28px; margin: 0; margin-bottom: 0; padding: 0; text-align: center;">
                                          Служба поддержки / <font style="color:#486482;font-size:19.2px">Support service</font>
                                        </p>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="3" style="height: 3px;line-height: 3px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->

                                        <p align="center"
                                          style="Margin: 0; Margin-bottom: 0; color: #514c46; font-family: Arial,sans-serif; font-size: 25px !important; font-weight: 400; line-height: 30px; margin: 0; margin-bottom: 0; padding: 0; text-align: center;">
                                          (10:00 &mdash; 01:00)
                                        </p>
                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="8" style="height: 8px;line-height: 8px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->

                                        <a href="tel:88122449824" width="200" height="46" align="center" style="display:inline-block;height: 46px; line-height: 46px; width: 200px;text-align:center" noopener noreferrer>
                                          <img width="200" height="46" align="center" src="https://nevatrip.ru/assets/img/email/btn-call-now.jpg" alt="Позвонить сейчас" style="-ms-interpolation-mode: bicubic; background: #f8d557; border: 0; border-radius: 46px; clear: both; color: #1f1c15; display: inline-block; font-size: 21px; font-weight: 700; height: 46px; line-height: 46px; max-width: 100%; outline: 0; text-align: center; text-decoration: none; vertical-align: middle; width: 200px;">
                                        </a>
                                        <!--позвонить сейчас-->

                                        <table>
                                          <tbody>
                                          <tr>
                                            <td height="10" style="height: 10px;line-height: 10px;">&nbsp;</td>
                                          </tr>
                                          </tbody>
                                        </table>
                                        <!--spacer-->

                                      </center>
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                                <!--служба поддержки, позвонить сейчас-->
                              </center>
                            </td>
                          </tr>
                          </tbody>
                        </table>
                        <!--белый фон-->
                        <table>
                          <tbody>
                          <tr>
                            <td height="5" style="height: 5px;line-height: 5px;">&nbsp;</td>
                          </tr>
                          </tbody>
                        </table>
                        <!--spacer-->
                        <p style="Margin: 0; Margin-bottom: 0; color: #FFFFFF; font-family: Arial,sans-serif; font-size: 14px !important; font-weight: 400; line-height: 19px; margin: 0; margin-bottom: 0; padding: 0; text-align: center;">
                          Если сообщение отображается некорректно, нажмите
                          <a href="#"
                            style="Margin: 0; color: #FFFFFF; font-family: Arial,sans-serif; font-weight: 400; line-height: 20px; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font
                              class="link" style="color: #FFFFFF; text-decoration: underline;">здесь</font></a>.
                          </br>
                          <font style="color:#FFFFFF;font-size:11.2px">
                            If the message is not displayed correctly, click <a href="#"
                                                                                style="Margin: 0; color: #FFFFFF; font-family: Arial,sans-serif; font-weight: 400; line-height: 20px; margin: 0; padding: 0; text-align: left; text-decoration: none;"><font
                              class="link" style="color: #FFFFFF; text-decoration: underline;">here</font></a>.
                          </font>
                        </p>
                        <!-- Если сообщение отображается некорректно, нажмите-->
                        <table>
                          <tbody>
                          <tr>
                            <td height="5" style="height: 5px;line-height: 5px;">&nbsp;</td>
                          </tr>
                          </tbody>
                        </table>
                        <!--spacer-->
                      </center>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <!--голубой фон-->
              </center>
            </td>
          </tr>
          </tbody>
        </table>
        <div style="white-space:nowrap!important;line-height: 0; color: #ffffff;">
          - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        </div>
        <style>
          .MsoNormal_mailru_css_attribute_postfix{
            margin: 0;
          }
        </style>
      </body>
    `,
    rejected: `Заказ отменён`,
    manager: `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif"><tbody><tr><td align="center" valign="top">
      <h3>Заявка на бронирование билетов</h3><table width="622" cellpadding="5" cellspacing="5" style="border:1px solid #dadada;"><tbody>
      <tr><th width="200" style="text-align: right;">№ Договора:</th><td>ООО "Про Событие"</td></tr>
      <tr><th style="text-align: right;">Название компании:</th><td>«Неватрип»</td></tr>
      <tr><th style="text-align: right;">Контактное лицо:</th><td>Команда Неватрип</td></tr>
      <tr><th style="text-align: right;">Контактный телефон:</th><td>89219653404</td></tr>
      <tr><th style="text-align: right;">Контактный E-mail:</th><td>order@nevatrip.ru</td></tr></tbody></table>
      <h3>Просим Вас забронировать билеты на прогулку:</h3><table width="622" cellpadding="5" cellspacing="5" style="border:1px solid #dadada;"><tbody>
      <tr><th style="text-align: right;" width="200">Дата:</th><td>в ночь с ${
        prevDateFormat.ru
      } на ${dateFormat.ru}</td></tr>
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

  const mailOptions = {
    from: '"NevaTrip" <order@nevatrip.ru>', // sender address
    to: status === 'manager' ? 'info@nevatrip.ru' : email, // list of receivers
    subject: 'Заказ', // Subject line
    text: JSON.stringify(order), // plain text body
    html: getMailContent(order, status),
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
