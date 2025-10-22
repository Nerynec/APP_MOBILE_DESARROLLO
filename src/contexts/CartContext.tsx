import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // opcional
import type { CartProduct } from '../models/product';

export type CartItem = { product: CartProduct; quantity: number };

export interface CartContextType {
  items: CartItem[];
  add: (product: CartProduct, qty?: number) => void;
  remove: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const num = (x: any, d = 0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

// Helpers de comparación robusta
const sid = (v: unknown) => String(v).trim();
const sameId = (a: unknown, b: unknown) => sid(a) === sid(b);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

<<<<<<< HEAD
  // (Opcional) hidratar
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('cart');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return;
        setItems(
          data.map((i) => ({
            product: {
              id: String(i?.product?.id ?? ''),
              name: String(i?.product?.name ?? ''),
              price: num(i?.product?.price, 0),
              image: i?.product?.image || undefined,
            },
            quantity: Math.max(1, num(i?.quantity, 1)),
          }))
        );
      } catch {}
    })();
  }, []);

  // (Opcional) persistir
  useEffect(() => {
    AsyncStorage.setItem('cart', JSON.stringify(items)).catch(() => {});
  }, [items]);

  const add = (product: CartProduct, qty: number = 1) => {
    const p: CartProduct = {
      id: String(product.id),
      name: String(product.name),
      price: num(product.price, 0),
      image: product.image || undefined,
    };
    const q = Math.max(1, num(qty, 1));

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === p.id);
      if (existing) return prev.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + q } : i));
      return [...prev, { product: p, quantity: q }];
=======
  const add = (product: Product, qty: number = 1) => {
    const norm: Product = { ...product, id: sid(product.id) };
    setItems(prev => {
      const exists = prev.find(i => sameId(i.product.id, norm.id));
      if (exists) {
        return prev.map(i =>
          sameId(i.product.id, norm.id) ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product: norm, quantity: qty }];
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
    });
  };

  const remove = (productId: string) => {
<<<<<<< HEAD
    setItems((prev) => prev.filter((i) => i.product.id !== String(productId)));
=======
    setItems(prev => {
      const target = sid(productId);
      // 1) intenta por ID exacto normalizado
      const filtered = prev.filter(i => !sameId(i.product.id, target));
      if (filtered.length !== prev.length) return filtered;

      // 2) fallback: intenta borrar por índice del primer match “suave”
      const idx = prev.findIndex(i => sid(i.product.id) === target);
      if (idx >= 0) {
        const next = prev.slice();
        next.splice(idx, 1);
        return next;
      }
      // si no encontró, devuelve el mismo arreglo (no cambia nada)
      return prev;
    });
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
  };
  const increaseQty = (productId: string) => {
<<<<<<< HEAD
    setItems((prev) => prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: i.quantity + 1 } : i)));
=======
    const pid = sid(productId);
    setItems(prev =>
      prev.map(i => (sameId(i.product.id, pid) ? { ...i, quantity: i.quantity + 1 } : i))
    );
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
  };
  const decreaseQty = (productId: string) => {
<<<<<<< HEAD
    setItems((prev) =>
      prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
=======
    const pid = sid(productId);
    // tu flujo original: nunca baja de 1
    setItems(prev =>
      prev.map(i =>
        sameId(i.product.id, pid) ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
      )
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
    );
  };
  const setQty = (productId: string, qty: number) => {
<<<<<<< HEAD
    const q = Math.max(1, num(qty, 1));
    setItems((prev) => prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: q } : i)));
=======
    if (qty < 1) return; // respetamos tu regla
    const pid = sid(productId);
    setItems(prev =>
      prev.map(i => (sameId(i.product.id, pid) ? { ...i, quantity: qty } : i))
    );
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
  };
  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + num(i.product.price, 0) * Math.max(1, num(i.quantity, 1)), 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + Math.max(1, num(i.quantity, 1)), 0), [items]);

<<<<<<< HEAD
  return (
    <CartContext.Provider value={{ items, add, remove, increaseQty, decreaseQty, setQty, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
=======
  const value: CartContextType = {
    items,
    add,
    remove,
    increaseQty,
    decreaseQty,
    setQty,
    clear,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
>>>>>>> a5fae1bd065d7b86b76e039055a4283ebfab0280
};
