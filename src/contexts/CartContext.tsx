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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: Product, qty: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const remove = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const increaseQty = (productId: string) => {
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decreaseQty = (productId: string) => {
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(1, i.quantity - 1) }
          : i
      )
    );
  };

  const setQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity: qty } : i
      )
    );
  };

  const clear = () => setItems([]);

  // Memoized totals to avoid unnecessary recalculations
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        increaseQty,
        decreaseQty,
        setQty,
        clear,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
