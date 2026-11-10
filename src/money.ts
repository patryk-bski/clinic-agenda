// Money is shown in euros, without cents (e.g. "€1,430"), on Reports and Billing alike
const money = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const formatMoney = (value: number) => money.format(value)
