export const getPaymentDescription = (count: number) => {
  const label = count < 2 ? 'экскурсии' : count + ' экскурсий';

  return `Покупка ${label} на сайте NevaTrip`;
};
