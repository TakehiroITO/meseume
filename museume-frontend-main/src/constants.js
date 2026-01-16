export const APP_TITLE = process.env.REACT_PUBLIC_TITLE;
export const BASE_URL = process.env.REACT_APP_BASE_BE_URL;
export const FE_BASE_URL = process.env.REACT_APP_BASE_FE_URL
export const USER_STATUS_COLOR_MAPPING = {
  active: "#94BA54",
  inactive: "#F25F5C"
};
export const USER_STATUS = [
  { title: "ACTIVE", value: "Active" },
  { title: "INACTIVE", value: "Inactive" },
];
export const REPORT_STATUS_COLOR_MAPPING = {
  accepted: "#94BA54",
  pending: "#F25F5C"
};

export const CURRENCY_SIGN_MAP =  {
  USD: '$', // US Dollar
  EUR: '€', // Euro
  JPY: '¥', // Japanese Yen
  GBP: '£', // British Pound
  AUD: 'A$', // Australian Dollar
  CAD: 'C$', // Canadian Dollar
  CHF: 'CHF', // Swiss Franc
  CNY: '¥', // Chinese Yuan
  SEK: 'kr', // Swedish Krona
  NZD: 'NZ$', // New Zealand Dollar
  INR: '₹', // Indian Rupee
  RUB: '₽', // Russian Ruble
  KRW: '₩', // South Korean Won
  ZAR: 'R', // South African Rand
  SGD: 'S$', // Singapore Dollar
  HKD: 'HK$', // Hong Kong Dollar
  MXN: '$', // Mexican Peso
  BRL: 'R$', // Brazilian Real
  THB: '฿', // Thai Baht
  TRY: '₺', // Turkish Lira
  NOK: 'kr', // Norwegian Krone
  DKK: 'kr', // Danish Krone
  PLN: 'zł', // Polish Zloty
  AED: 'د.إ', // UAE Dirham
  SAR: '﷼', // Saudi Riyal
  MYR: 'RM', // Malaysian Ringgit
  IDR: 'Rp', // Indonesian Rupiah
  PHP: '₱', // Philippine Peso
  VND: '₫', // Vietnamese Dong
  TWD: 'NT$', // New Taiwan Dollar
};
