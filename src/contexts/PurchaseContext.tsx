import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  providerId: string;
  invoiceNumber: string;
  purchaseDate: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

interface PurchaseContextType {
  purchases: Purchase[];
  currentPurchase: {
    providerId: string;
    invoiceNumber: string;
    purchaseDate: string;
    items: PurchaseItem[];
  };
  setCurrentPurchase: (purchase: any) => void;
  addItemToCurrentPurchase: (item: PurchaseItem) => void;
  removeItemFromCurrentPurchase: (index: number) => void;
  updateItemInCurrentPurchase: (index: number, item: Partial<PurchaseItem>) => void;
  savePurchase: () => void;
  clearCurrentPurchase: () => void;
  getPurchaseById: (id: string) => Purchase | undefined;
  getTotalPurchases: () => number;
  getCurrentPurchaseTotal: () => number;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};

interface PurchaseProviderProps {
  children: ReactNode;
}

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({ children }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState({
    providerId: '1',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    items: [] as PurchaseItem[],
  });

  const addItemToCurrentPurchase = (item: PurchaseItem) => {
    setCurrentPurchase((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  };

  const removeItemFromCurrentPurchase = (index: number) => {
    setCurrentPurchase((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItemInCurrentPurchase = (index: number, updatedItem: Partial<PurchaseItem>) => {
    setCurrentPurchase((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, ...updatedItem };
          updated.subtotal = updated.quantity * updated.unitCost;
          return updated;
        }
        return item;
      }),
    }));
  };

  const getCurrentPurchaseTotal = () => {
    return currentPurchase.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const savePurchase = () => {
    if (currentPurchase.items.length === 0) {
      throw new Error('No se pueden guardar compras sin productos');
    }

    const newPurchase: Purchase = {
      id: `PUR-${Date.now()}`,
      providerId: currentPurchase.providerId,
      invoiceNumber: currentPurchase.invoiceNumber,
      purchaseDate: currentPurchase.purchaseDate,
      items: currentPurchase.items,
      total: getCurrentPurchaseTotal(),
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    clearCurrentPurchase();
  };

  const clearCurrentPurchase = () => {
    setCurrentPurchase({
      providerId: '1',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      items: [],
    });
  };

  const getPurchaseById = (id: string) => {
    return purchases.find((p) => p.id === id);
  };

  const getTotalPurchases = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  };

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        currentPurchase,
        setCurrentPurchase,
        addItemToCurrentPurchase,
        removeItemFromCurrentPurchase,
        updateItemInCurrentPurchase,
        savePurchase,
        clearCurrentPurchase,
        getPurchaseById,
        getTotalPurchases,
        getCurrentPurchaseTotal,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};