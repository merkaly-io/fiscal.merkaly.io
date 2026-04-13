export interface Customer {
  address?: string;
  cnpj?: string;
  name?: string;
}

export interface Item {
  ean?: string;
  measure?: string;
  price: number;
  product?: string;
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
  items: Item[];
  key: string | null;
  payments: Payment[];
  pricing: Pricing;
  url: string;
}
