// src/services/sales.api.ts
import { http } from './http';

// ---- Tipos mínimos (ajústalos a lo que devuelva tu API si quieres tipar mejor) ----
export type CartItem = {
  productId: number;
  qty: number;
  name?: string;
  price?: number;
  subtotal?: number;
};
export type Cart = {
  cartId: number;
  items: CartItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  taxRate?: number;
};

export type CreateCartDto = { taxRate?: number };
export type AddItemDto   = { productId: number; qty: number };
export type SetItemDto   = { productId: number; qty: number }; // qty=0 elimina
export type CheckoutDto  = { paymentMethodCode?: string };     // ej: 'CASH'

// ---- Endpoints ----
export async function createOrGetCart(dto: CreateCartDto = {}) {
  const res = await http.post<Cart>('/sales/cart', dto);
  return res.data;
}

export async function getMyCart() {
  const res = await http.get<Cart>('/sales/cart');
  return res.data;
}

export async function addItem(dto: AddItemDto) {
  const res = await http.post<Cart>('/sales/cart/items', dto);
  return res.data;
}

export async function setItem(dto: SetItemDto) {
  const res = await http.put<Cart>('/sales/cart/items', dto);
  return res.data;
}

export async function removeItem(productId: number) {
  const res = await http.delete<Cart>(`/sales/cart/items/${productId}`);
  return res.data;
}

export async function checkout(dto: CheckoutDto = {}) {
  const res = await http.post('/sales/cart/checkout', dto);
  return res.data; // suele venir comprobante/venta creada
}
