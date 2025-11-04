import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

type Dish = { id: string; name: string; description: string; price: number; image?: string };

const placeholder: Dish[] = [
  { id: '1', name: 'Bruschetta Classica', description: 'Färska tomater, basilika, vitlök på rostat surdegsbröd', price: 95, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop' },
  { id: '2', name: 'Pasta Carbonara', description: 'Klassisk carbonara med pancetta, ägg och parmesan', price: 185, image: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?q=80&w=1200&auto=format&fit=crop' },
  { id: '3', name: 'Pizza Margherita', description: 'Tomatsås, mozzarella, basilika', price: 165, image: 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?q=80&w=1200&auto=format&fit=crop' },
  { id: '4', name: 'Grillad Lax', description: 'Färsk lax med rostad citron och grönsaker', price: 245, image: 'https://images.unsplash.com/photo-1604908554027-6155c1f39d3a?q=80&w=1200&auto=format&fit=crop' },
  { id: '5', name: 'Risotto ai Funghi', description: 'Krämig risotto med svamp och parmesan', price: 195, image: 'https://images.unsplash.com/photo-1476127394940-6d33b6a3b54b?q=80&w=1200&auto=format&fit=crop' },
  { id: '6', name: 'Tiramisu', description: 'Klassisk italiensk dessert med mascarpone och kaffe', price: 85, image: 'https://images.unsplash.com/photo-1604908883213-2a3d549274a9?q=80&w=1200&auto=format&fit=crop' }
];

export default function Menu() {
  const [items, setItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    let mounted = true;
    api.getMenu()
      .then(data => { if (mounted) setItems(Array.isArray(data) && data.length ? data : placeholder); })
      .catch(() => { if (mounted) setItems(placeholder); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="container"><p>Laddar meny…</p></div>;
  }

  return (
    <div className="container menu-container">
      <header className="menu-header">
        <h1>Vår Meny</h1>
        <p>Upptäck våra autentiska italienska rätter tillagade med kärlek och passion</p>
      </header>

      <div className="menu-grid">
        {items.map(i => (
          <article className="menu-card" key={i.id}>
            {i.image && (
              <div className="menu-card-media">
                <img src={i.image} alt={i.name} loading="lazy" />
              </div>
            )}
            <div className="menu-card-body">
              <h3>{i.name}</h3>
              <p className="muted">{i.description}</p>
              <div className="menu-card-actions">
                <strong>{i.price} kr</strong>
                <button className="btn primary" onClick={() => add({ id: i.id, name: i.name, price: i.price, quantity: 1 })}>
                  + Lägg till
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="menu-footer">
        <button className="btn">Visa fler rätter</button>
      </div>
    </div>
  );
}

