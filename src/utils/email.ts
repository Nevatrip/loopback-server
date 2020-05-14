import { Order } from '../models';
import { createTransport } from 'nodemailer';
import { renderEmail } from '../utils/renderEmail';

const {
  SMTP_USER: SMTPUser = 'test@test.test',
  SMTP_PASS: SMTPPass,
  APP_NAME: appName,
} = process.env;

type Status = 'new' | 'paid' | 'rejected' | 'manager';

const getMailContent = (order: Order, status: Status) => {
  const content = {
    new: JSON.stringify(order),
    paid: renderEmail({ page: 'notification', api: order }),
    rejected: `Заказ отменён`,
    manager: renderEmail({ page: 'operator-en', api: order }),
  };

  return content[status];
};

export const sendEmail = (order: Order, status: Status, _email?: string) => {
  const {
    user: { email },
    products: [
      {
        product: {
          directions,
        },
        options: { number, direction },
      },
    ],
  } = order;

  const selectedDirection = directions.find(dir => dir._key === direction);

  if (!selectedDirection) return;

  const {
    partnerName: partnerSubject,
    partner: { email: partnerEmail = 'tech-support@nevatrip.ru' } = {
      email: 'tech-support@nevatrip.ru',
    },
  } = selectedDirection;

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
    from: `"${appName}" <${SMTPUser}>`,
    html: mailContent,
    to: status === 'manager' ? [partnerEmail, SMTPUser, 'elizabeth.zolotaryova@gmail.com', 'order@nevatrip.ru', 'info@prahatrip.cz'] : _email || email, // list of receivers
    subject: status === 'manager' ? `${ partnerSubject } Transaction number: PT${ number }` : `Thank you for your order! Transaction number: PT${ number }`, // `E-ticket / Билет на экскурсию «${title}» НТ${number}`,
    text: JSON.stringify(order), // plain text body
  };

  transporter.sendMail(
    mailOptions,
    // tslint:disable-next-line: no-any
    (error: any, info: { messageId: any; response: any }) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    },
  );
};
