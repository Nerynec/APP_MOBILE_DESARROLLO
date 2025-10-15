import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Product {
  id: number;
  nombre: string;
  cantidad: number;
  estado: 'Stock medio' | 'Stock bajo' | 'Stock alto' | 'Sin stock';
  precio?: number;
  categoria?: string;
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
  searchProducts: (query: string) => Product[];
  filterByEstado: (estado: string) => Product[];
  totalProducts: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, nombre: 'Martillo de uña 16 oz', cantidad: 38, estado: 'Stock medio' },
    { id: 2, nombre: 'Varilla corrugada 3/8" (por metro)', cantidad: 30, estado: 'Stock medio' },
    { id: 3, nombre: 'Pinza universal 8"', cantidad: 10, estado: 'Stock medio' },
    { id: 4, nombre: 'Cinta métrica 5 m x 25 mm', cantidad: 10, estado: 'Stock medio' },
    { id: 5, nombre: 'Block de concreto 12x20x40 cm', cantidad: 10, estado: 'Stock medio' },
    { id: 6, nombre: 'Codo PVC 1/2" 90°', cantidad: 10, estado: 'Stock medio' },
  ]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { ...product, id: newId }]);
  };

  const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...updatedProduct } : p
    ));
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductById = (id: number) => {
    return products.find(p => p.id === id);
  };

  const searchProducts = (query: string) => {
    if (!query) return products;
    return products.filter(p => 
      p.nombre.toLowerCase().includes(query.toLowerCase()) ||
      p.id.toString().includes(query)
    );
  };

  const filterByEstado = (estado: string) => {
    if (estado === 'Todos') return products;
    return products.filter(p => p.estado === estado);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchProducts,
        filterByEstado,
        totalProducts: products.length,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};