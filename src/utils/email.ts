import {Order} from '../models';
import {PaymentSuccessResponse} from 'cloudpayments';
import {createTransport} from 'nodemailer';

const SMTPUser = process.env.SMTP_USER;
const SMTPPass = process.env.SMTP_PASS;

const getMailContent = (order: Order) => {
  const {
    user: {fullname, phone, email},
    products,
    payment,
  } = order;

  return `
    <h3>Новый заказ для ${fullname}</h3>
    <p>Если произойдут какие-то изменения, мы предупредим вас по телефону ${phone}</p>
    <p>Товары:</p>
    <ul>
      ${(products || []).map(product => `<li>${JSON.stringify(product)}</li>`)}
    </ul>
    <p>Сумма: ${(payment as PaymentSuccessResponse).Model.Amount} ₽</p>
    <p>Ссылка на оплату: ${(payment as PaymentSuccessResponse).Model.Url}</p>
    <p>Ваш email: ${email}</p>
  `;
};

export const sendEmail = (order: Order) => {
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
    from: '"Roman Ganin" <realetive@yandex.ru>', // sender address
    to: email, // list of receivers
    subject: 'Заказ', // Subject line
    text: JSON.stringify(order), // plain text body
    html: getMailContent(order),
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
