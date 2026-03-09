export type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export type Receipt = {
  id: string;
  user_id: string;
  store: string;
  date: string;
  total: number;
  image_url: string | null;
  raw_text: string | null;
  created_at: string;
  receipt_items?: ReceiptItem[];
};

export type ReceiptItem = {
  id: string;
  receipt_id: string;
  name_raw: string;
  name_normalized: string | null;
  price: number;
  quantity: number;
  size_value: number | null;
  size_unit: string | null;
  unit_price: number | null;
  created_at: string;
};

export type SpendPoint = {
  month: string;
  spend: number;
};

export type PricePoint = {
  date: string;
  price: number;
  store: string;
};
