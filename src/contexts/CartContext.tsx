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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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
    });
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== String(productId)));
  };
  const increaseQty = (productId: string) => {
    setItems((prev) => prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: i.quantity + 1 } : i)));
  };
  const decreaseQty = (productId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
    );
  };
  const setQty = (productId: string, qty: number) => {
    const q = Math.max(1, num(qty, 1));
    setItems((prev) => prev.map((i) => (i.product.id === String(productId) ? { ...i, quantity: q } : i)));
  };
  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + num(i.product.price, 0) * Math.max(1, num(i.quantity, 1)), 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + Math.max(1, num(i.quantity, 1)), 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, increaseQty, decreaseQty, setQty, clear, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
