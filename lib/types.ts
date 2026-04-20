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
  free: boolean;
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
  extras: {
    sourceFile: boolean;
    commercialRights: boolean;
    urgent: boolean;
  };
  discount: number;
  discountUnit: "baht" | "percent";
  startDate: string;
  endDate: string;
  paymentTerm: "30" | "50" | "70" | "full";
  paymentCondition: string;
  preparedBy: string;
}

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
  extras: {
    sourceFile: false,
    commercialRights: false,
    urgent: false,
  },
  discount: 0,
  discountUnit: "percent",
  startDate: "",
  endDate: "",
  paymentTerm: "50",
  paymentCondition: "การชำระมัดจำก่อนเริ่มงาน",
  preparedBy: "FreelanceSolo",
};
