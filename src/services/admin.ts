// src/services/admin.ts
import { http } from '../services/http'; // o '../lib/api' si así lo tienes

export type DashboardResp = {
  summary: {
    orders: number;
    revenue: number;
    gross_sales: number;
    discounts: number;
    taxes: number;
    avg_order_value: number;
  };
  daily: { day: string; orders: number; revenue: number }[];
  topProducts: { product_id: number; product_name: string; units: number; revenue: number }[];
  byCategory: { category_id: number | null; category_name: string | null; revenue: number }[];
  byPayment: { payment_method_code: string; payment_method_name: string; orders: number; revenue: number }[];
  byChannel: { channel: 'POS' | 'WEB'; orders: number; revenue: number }[];
  byHour: { hour_of_day: number; orders: number; revenue: number }[];
};

export async function getDashboard(from: string, to: string): Promise<DashboardResp> {
  const { data } = await http.get<DashboardResp>('/admin/dashboard', { params: { from, to } });
  return data;
}
