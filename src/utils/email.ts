import {Order} from '../models';
import {createTransport} from 'nodemailer';
import {renderEmail} from '../utils/renderEmail';

const SMTPUser = process.env.SMTP_USER;
const SMTPPass = process.env.SMTP_PASS;

type Status = 'new' | 'paid' | 'rejected' | 'manager';

let number = '¯\\_(ツ)_/¯';
let title = 'Название экскурсии';

const getMailContent = (order: Order, status: Status) => {
  const content = {
    new: JSON.stringify(order),
    paid: renderEmail({page: 'email', api: order}),
    rejected: `Заказ отменён`,
    manager: renderEmail({page: 'operator', api: order}),
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
