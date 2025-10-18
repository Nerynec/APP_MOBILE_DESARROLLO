import React, { createContext, useContext, useState, useMemo } from 'react';

export type Product = { id: string; name: string; price: number; image?: string };
export type CartItem = { product: Product; quantity: number };

export interface CartContextType {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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
    });
  };

  const remove = (productId: string) => {
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
  };

  const increaseQty = (productId: string) => {
    const pid = sid(productId);
    setItems(prev =>
      prev.map(i => (sameId(i.product.id, pid) ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decreaseQty = (productId: string) => {
    const pid = sid(productId);
    // tu flujo original: nunca baja de 1
    setItems(prev =>
      prev.map(i =>
        sameId(i.product.id, pid) ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
      )
    );
  };

  const setQty = (productId: string, qty: number) => {
    if (qty < 1) return; // respetamos tu regla
    const pid = sid(productId);
    setItems(prev =>
      prev.map(i => (sameId(i.product.id, pid) ? { ...i, quantity: qty } : i))
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

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
};
