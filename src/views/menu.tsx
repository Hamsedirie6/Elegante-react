import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

type Dish = { id: string; name: string; description: string; price: number; image?: string };

const placeholder: Dish[] = [
  { id: '1', name: 'Bruschetta Classica', description: 'Färska tomater, basilika, vitlök', price: 95 },
  { id: '2', name: 'Pasta Carbonara', description: 'Klassisk carbonara', price: 185 },
  { id: '3', name: 'Pizza Margherita', description: 'Tomatsås, mozzarella, basilika', price: 165 }
];

export default function Menu() {
  const [items, setItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    // TODO: Byt till fetch('/api/menu') när endpoint finns
    setItems(placeholder);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="container"><p>Laddar meny…</p></div>;
  }

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.matches('button.btn.primary')) {
        const card = target.closest('div[data-id]') as HTMLElement | null;
        if (!card) return;
        const id = card.getAttribute('data-id') || '';
        const name = (card.querySelector('h3')?.textContent || '').trim();
        const priceText = (card.querySelector('strong')?.textContent || '0').replace(/[^0-9]/g, '');
        const price = parseInt(priceText, 10) || 0;
        if (id && name && price > 0) {
          add({ id, name, price, quantity: 1 });
        }
      }
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [add]);

  return (
    <div className="container" ref={containerRef}>
      <h1>Vår Meny</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {items.map(i => (
          <div key={i.id} data-id={i.id} style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>{i.name}</h3>
            <p style={{ color: '#666' }}>{i.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{i.price} kr</strong>
              <button className="btn primary">+ Lägg till</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


 
