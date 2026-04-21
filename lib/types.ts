export interface Customer {
  name: string;
  phone: string;
  lineId: string;
  email: string;
  address: string;
  taxId: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  quantity: number;
  free: boolean;
}

export interface ExtraOption {
  id: string;
  label: string;
  percent: number;
  enabled: boolean;
  removable: boolean;
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  type: "deposit" | "draft" | "revision" | "final";
}

export interface Profile {
  studioName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  currency: string;
  terms: string;
  logo: string;
}

export interface QuoteSettings {
  customer: Customer;
  projectName: string;
  difficultCommunication: boolean;
  frequentChanges: boolean;
  hiddenCost: string;
  revisions: number;
  revisionFee: number;
  revisionFeeUnit: "baht" | "percent";
  tax3Percent: boolean;
  services: Service[];
  extras: ExtraOption[];
  discount: number;
  discountUnit: "baht" | "percent";
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  paymentTerm: "30" | "50" | "70" | "full";
  paymentCondition: string;
  preparedBy: string;
}

export const CURRENCIES = [
  { code: "THB", symbol: "฿", label: "฿ (THB)" },
  { code: "USD", symbol: "$", label: "$ (USD)" },
  { code: "EUR", symbol: "€", label: "€ (EUR)" },
  { code: "GBP", symbol: "£", label: "£ (GBP)" },
  { code: "JPY", symbol: "¥", label: "¥ (JPY)" },
  { code: "CNY", symbol: "¥", label: "¥ (CNY)" },
  { code: "KRW", symbol: "₩", label: "₩ (KRW)" },
  { code: "VND", symbol: "₫", label: "₫ (VND)" },
  { code: "SGD", symbol: "S$", label: "S$ (SGD)" },
  { code: "MYR", symbol: "RM", label: "RM (MYR)" },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "฿";
}

export const DEFAULT_EXTRAS: ExtraOption[] = [
  {
    id: "source_file",
    label: "ไฟล์ต้นฉบับ",
    percent: 20,
    enabled: false,
    removable: false,
  },
  {
    id: "commercial_rights",
    label: "สิทธิ์เชิงพาณิชย์",
    percent: 30,
    enabled: false,
    removable: false,
  },
  {
    id: "urgent",
    label: "งานด่วน",
    percent: 25,
    enabled: false,
    removable: false,
  },
];

export const DEFAULT_PROFILE: Profile = {
  studioName: "FreelanceSolo",
  tagline: "โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย",
  ownerName: "FreelanceSolo",
  phone: "",
  email: "",
  address: "",
  taxId: "",
  currency: "THB",
  terms:
    "• ชำระมัดจำเพื่อเริ่มงาน\n• โอนลิขสิทธิ์เมื่อชำระเต็ม\n• แก้ไขเพิ่มเติม ฿500 ต่อรอบ",
  logo: "",
};

export const DEFAULT_QUOTE: QuoteSettings = {
  customer: {
    name: "",
    phone: "",
    lineId: "",
    email: "",
    address: "",
    taxId: "",
  },
  projectName: "",
  difficultCommunication: false,
  frequentChanges: false,
  hiddenCost: "",
  revisions: 3,
  revisionFee: 500,
  revisionFeeUnit: "baht",
  tax3Percent: false,
  services: [],
  extras: DEFAULT_EXTRAS,
  discount: 0,
  discountUnit: "percent",
  startDate: "",
  endDate: "",
  milestones: [],
  paymentTerm: "50",
  paymentCondition: "ชำระมัดจำก่อนเริ่มงาน",
  preparedBy: "FreelanceSolo",
};
