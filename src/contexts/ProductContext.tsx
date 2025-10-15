import React, { createContext, useContext, useState } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

type ProductContextType = {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
};

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Machete 22"',
      price: 149,
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919',
    },
    {
      id: '2',
      name: 'Tijera para podar',
      price: 135,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    },
  ]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductProvider');
  return ctx;
};
