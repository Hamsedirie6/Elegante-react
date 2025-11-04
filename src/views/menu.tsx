import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // TODO: Byt till fetch('/api/menu') när endpoint finns
    setItems(placeholder);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="container"><p>Laddar meny…</p></div>;
  }

  return (
    <div className="container">
      <h1>Vår Meny</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {items.map(i => (
          <div key={i.id} style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, background: '#fff' }}>
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


 