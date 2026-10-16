import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edrucorbbdhihifnjohe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_feSilq-DbNmSJ_Phi3jKpw_YrxNIk0i';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbCustomer {
  id: string;
  phone: string;
  name: string;
  address?: string;
  rank: 'Mầm Nhỏ' | 'Bé Ngoan' | 'Mẹ Thông Thái' | 'Mẹ Kim Cương';
  total_orders: number;
  total_spent: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbOrder {
  id?: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  order_note?: string;
  items: any[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  carrier: string;
  status: string;
  shipping_status: string;
  created_at?: string;
}
