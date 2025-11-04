import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = { id: string; name: string; price: number; quantity: number };

type CartState = {
  items: CartItem[];
  total: number;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(
    () => {
      try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
      catch { return []; }
    }
  );

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const add: CartState['add'] = (item) => {
    setItems(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p);
      return [...prev, item];
    });
  };

  const remove: CartState['remove'] = (id) => setItems(prev => prev.filter(p => p.id !== id));

  const setQuantity: CartState['setQuantity'] = (id, quantity) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(p => p.id !== id);
      return prev.map(p => p.id === id ? { ...p, quantity } : p);
    });
  };

  const clear = () => setItems([]);

  const value = useMemo<CartState>(() => ({ items, total, add, remove, setQuantity, clear }), [items, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

