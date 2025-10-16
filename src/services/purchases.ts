// src/services/purchases.ts
// ⬇️ AJUSTA esta ruta al http de tu proyecto
import { http } from '../services/http';

export type PurchaseItem = { productId: number; qty: number; unitCost: number; taxRate?: number };
export type StockItem = { productId: number; name: string; stock: number };

export async function createPurchase(payload: {
  supplierId: number;
  invoiceNumber?: string;
  purchaseDate?: string; // 'YYYY-MM-DD'
  items: PurchaseItem[];
}) {
  const { data } = await http.post('/purchases', payload);
  return data as { purchaseId: number; status: string };
}

export async function receivePurchase(id: number, userId?: number) {
  const body = userId !== undefined ? { userId: Number(userId) } : {};
  const { data } = await http.post(`/purchases/${id}/receive`, body);
  return data as { purchaseId: number; status: string; subtotal: number; tax: number };
}

export async function getStock() {
  const { data } = await http.get('/purchases/stock');
  return data as StockItem[];
}
