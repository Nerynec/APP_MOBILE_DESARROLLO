// services/sales.api.ts
import { http } from './http';

<<<<<<< HEAD
export type CartItem = { productId: number; qty: number; name?: string; price?: number; subtotal?: number };
export type Cart = { cartId: number; items: CartItem[]; subtotal?: number; tax?: number; total?: number; taxRate?: number };

export type CreateCartDto = { taxRate?: number };
export type AddItemDto   = { productId: number; qty: number };
export type SetItemDto   = { productId: number; qty: number };
export type CheckoutDto  = { paymentMethodCode?: string };
=======
// ---- Tipos mínimos ----
export type CartItem = { productId: number; qty: number; name?: string; price?: number; subtotal?: number };
export type Cart = { cartId: number | null; status?: 'CART' | 'PAID' | 'EMPTY'; items: CartItem[]; subtotal?: number; tax?: number; total?: number; taxRate?: number };
export type CreateCartDto = { taxRate?: number };
export type AddItemDto   = { productId: number; qty: number };
export type SetItemDto   = { productId: number; qty: number };
export type CheckoutDto  = any;

// ---- Alineado a la web ----
export type CheckoutItem = { productId: number | string; quantity: number; unitPrice: number };
export type CheckoutPayload = {
  items: CheckoutItem[];
  summary: { subtotal: number; tax: number; shipping: number; total: number };
  customer: { name: string; phone: string; email?: string; nit?: string; address?: string };
  delivery: { method: 'pickup' | 'delivery' };
  payment: { method: 'cash' | 'card' | 'transfer'; reference?: string };
};
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280

export async function createOrGetCart(dto: CreateCartDto = {}) {
	const res = await http.post<Cart>('/sales/cart', dto);
	return res.data;
}
export async function getMyCart() {
	const res = await http.get<Cart>('/sales/cart');
	return res.data;
}
<<<<<<< HEAD
=======
export async function addItem(dto: AddItemDto) {
  const res = await http.post<Cart>('/sales/cart/items', dto);
  return res.data;
}
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
export async function setItem(dto: SetItemDto) {
	const res = await http.put<Cart>('/sales/cart/items', dto);
	return res.data;
}
<<<<<<< HEAD
export async function addItem(dto: AddItemDto) {                 // ✅ NUEVO
	const res = await http.post<Cart>('/sales/cart/items', dto);
	return res.data;
}
export async function removeItem(productId: number) {            // ✅ NUEVO
	const res = await http.delete<Cart>(`/sales/cart/items/${productId}`);
	return res.data;
}
export async function checkout(dto: CheckoutDto = {}) {
	const res = await http.post('/sales/cart/checkout', dto);
	return res.data;
}

/**
 * Sincroniza el carrito del servidor para que quede EXACTAMENTE igual al local:
 * - ADD (POST) si no existe
 * - SET (PUT) si existe pero cambia la cantidad
 * - REMOVE (DELETE) lo que sobra en el servidor
 */
export async function syncServerCart(
	local: Array<{ productId: string | number; quantity: number }>,
	taxRate = 12,
): Promise<Cart> {
	// 1) asegurar carrito (misma tasa IVA)
	await createOrGetCart({ taxRate });

	// 2) normalizar locales (números y cantidades ≥ 1)
	const clean = local
		.map(i => ({ productId: Number(i.productId), qty: Math.max(1, Number(i.quantity)) }))
		.filter(i => Number.isFinite(i.productId) && i.productId > 0);

	// 3) leer estado actual del server
	const serverBefore = await getMyCart();
	const serverMap = new Map<number, number>(serverBefore.items.map(i => [Number(i.productId), Number(i.qty)]));

	// 4) upsert: add si no existe, set si cambió cantidad
	for (const it of clean) {
		if (serverMap.has(it.productId)) {
			const current = serverMap.get(it.productId)!;
			if (current !== it.qty) {
				await setItem({ productId: it.productId, qty: it.qty });
			}
			serverMap.delete(it.productId); // marcado como sincronizado
		} else {
			await addItem({ productId: it.productId, qty: it.qty }); // 👈 faltaba en tu versión
		}
	}

	// 5) eliminar en server lo que ya no está en local (opcional pero recomendado)
	for (const [pid] of serverMap) {
		await removeItem(pid);
	}

	// 6) devolver cómo quedó
	return getMyCart();
}

/** Helper opcional para hacer sync + checkout en una llamada sencilla */
export async function placeOrderRN(
	local: Array<{ productId: string | number; quantity: number }>,
	taxRate = 12,
	paymentMethodCode: 'CASH' | 'CARD' | 'TRANSFER' = 'CASH'
) {
	await syncServerCart(local, taxRate);
	return checkout({ paymentMethodCode });
=======
export async function removeItem(productId: number) {
  const res = await http.delete<Cart>(`/sales/cart/items/${productId}`);
  return res.data;
}
export async function checkout(dto: CheckoutDto = {}) {
  const res = await http.post('/sales/cart/checkout', dto);
  return res.data;
}

// ---- Igual que web, pero bloqueando 'summary.total' en el checkout ----
export async function placeOrderMobile(payload: CheckoutPayload) {
  // 1) Asegurar carrito con tasa IVA del front
  const taxRate =
    Math.round((Number(payload.summary.tax || 0) / Math.max(1, Number(payload.summary.subtotal || 0))) * 100) || 12;
  await createOrGetCart({ taxRate });

  // 2) Obtener carrito actual del server
  const server = await getMyCart();
  const serverMap = new Map(server.items.map(i => [Number(i.productId), Number(i.qty)]));

  // 3a) upsert/ajustar cantidades
  for (const it of payload.items) {
    const pid = Number(it.productId);
    const q = Number(it.quantity);
    if (serverMap.has(pid)) {
      if (serverMap.get(pid) !== q) await setItem({ productId: pid, qty: q });
      serverMap.delete(pid);
    } else {
      await addItem({ productId: pid, qty: q });
    }
  }

  // 3b) quitar en server los que ya no están en local
  for (const [pid] of serverMap) {
    await removeItem(pid);
  }

  // 4) Checkout — quitar 'total' para no intentar escribir columna generada
  const { total: _ignore, ...summaryNoTotal } = payload.summary as any;
  const checkoutDto = {
    customer: payload.customer,
    delivery: payload.delivery,
    payment: payload.payment,
    summary: summaryNoTotal, // 👈 sin total
  };
  return checkout(checkoutDto);
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
}
