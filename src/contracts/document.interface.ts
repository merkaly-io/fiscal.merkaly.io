export interface Customer {
  address?: string;
  cnpj?: string;
  name?: string;
}

export interface Item {
  gtin?: string;
  measure?: string;
  name?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Payment {
  method?: string;
  paid: number;
}

export interface Pricing {
  discount: number;
  subtotal: number;
  total: number;
}

export interface FiscalDocument {
  customer: Customer;
  issuedAt?: string | null;
  items: Item[];
  key: string | null;
  payments: Payment[];
  pricing: Pricing;
  url: string;
}
