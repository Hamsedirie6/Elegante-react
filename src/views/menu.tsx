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
  { id: '6', name: 'Tiramisu', description: 'Klassisk italiensk dessert med mascarpone och kaffe', price: 85, image: 'https://images.unsplash.com/photo-1604908883213-2a3d549274a9?q=80&w=1200&auto=format&fit=crop' },
  { id: '7', name: 'Insalata Caprese', description: 'Mozzarella, tomater och basilika med olivolja', price: 145, image: 'https://www.lilvienna.com/wp-content/uploads/Recipe-Classic-Italian-Caprese-Salad.jpg' },
  { id: '8', name: 'Gnocchi al Pesto', description: 'Potatisgnocchi med basilika-pestosås och parmesan', price: 175, image: 'https://images.unsplash.com/photo-1625944525720-83bca9099ded?q=80&w=1200&auto=format&fit=crop' },
  { id: '9', name: 'Panna Cotta', description: 'Vaniljpannacotta med bärkompott', price: 95, image: 'https://images.unsplash.com/photo-1511910849309-0dffb63a3e0e?q=80&w=1200&auto=format&fit=crop' }
];

export default function Menu() {
  const [items, setItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const [visible, setVisible] = useState(6);

  const withReplacedImages = (list: Dish[]): Dish[] =>
    list.map(d => {
      if (d.name === 'Bruschetta Classica') {
        return { ...d, image: 'https://www.tastingtable.com/img/gallery/classic-bruschetta-recipe/intro-1642022550.jpg' };
      }
      if (d.name === 'Pasta Carbonara') {
        return { ...d, image: 'https://www.zeta.nu/app/uploads/2025/06/Pastacarbonara_liggande.webp' };
      }
      if (d.name === 'Pizza Margherita') {
        return { ...d, image: 'https://images.arla.com/recordid/17ADC8DB-DBC5-4DFA-AA85A07EEF36E4E7/pizza-margherita.jpg' };
      }
      if (d.name === 'Grillad Lax') {
        return { ...d, image: 'https://static.vecteezy.com/ti/gratis-foton/p1/65952590-elegant-grillad-lax-filea-eras-atop-kramig-mosad-potatisar-vackert-garnerad-i-en-varmtonad-restaurang-miljo-fotona.jpeg' };
      }
      if (d.name === 'Risotto ai Funghi') {
        return { ...d, image: 'https://images.getrecipekit.com/20250606114219-risotto-20mit-20pilzen-20produktbild.webp?aspect_ratio=1:1&quality=90&' };
      }
      if (d.name === 'Tiramisu') {
        return { ...d, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPcmHxSQ9j3leDWCnHISlloK8qmWl55PYCdQ&s' };
      }
      if (d.name === 'Insalata Caprese') {
        return { ...d, image: 'https://www.lilvienna.com/wp-content/uploads/Recipe-Classic-Italian-Caprese-Salad.jpg' };
      }
      if (d.name === 'Gnocchi al Pesto') {
        return { ...d, image: 'https://qbcucina.com/cdn/shop/articles/img-1713808789633_a37501db-2cb5-404a-9bff-eed4f8c45977_1200x.png?v=1713810591' };
      }
      if (d.name === 'Panna Cotta') {
        return { ...d, image: 'https://www.allrecipes.com/thmb/NlP50cO2BjJdN4uGvl5JhW0Rx2A=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-72567-Panna-cotta-ddmfs-4x3-14ae724a2a8e4ca3a79c5e27b2b61994.jpg' };
      }
      return d;
    });

  useEffect(() => {
    let mounted = true;
    api.getMenu()
      .then(data => {
        if (mounted) {
          const list = Array.isArray(data) && data.length ? data as Dish[] : placeholder;
          setItems(withReplacedImages(list));
        }
      })
      .catch(() => { if (mounted) setItems(withReplacedImages(placeholder)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Toggle: show more/less dishes using the existing button
  useEffect(() => {
    const btn = document.querySelector('.menu-footer .btn') as HTMLButtonElement | null;
    if (!btn) return;
    // Update button label based on state
    btn.textContent = visible >= items.length ? 'Visa färre rätter' : 'Visa fler rätter';
    const onClick = () => {
      setVisible(v => {
        if (v >= items.length) return 6; // collapse back
        return Math.min(v + 3, items.length); // show 3 more
      });
    };
    btn.addEventListener('click', onClick);
    return () => { btn.removeEventListener('click', onClick); };
  }, [visible, items.length]);

  if (loading) {
    return <div className="container"><p>Laddar meny…</p></div>;
  }

  return (
    <>
    <div className="container menu-container">
      <header className="menu-header">
        <h1>Vår Meny</h1>
        <p>Upptäck våra autentiska italienska rätter tillagade med kärlek och passion</p>
      </header>

      <div className="menu-grid">
        {items.slice(0, visible).map(i => (
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

    <section className="home-footer">
      <div className="container home-footer-inner">
        <div className="home-footer-col">
          <h4>Elegante</h4>
          <p>En kulinarisk upplevelse som kombinerar traditionell elegans med modern gastronomi.</p>
        </div>
        <div className="home-footer-col">
          <h4>Kontakt</h4>
          <p>Storgatan 15, 111 51</p>
          <p>Stockholm</p>
          <p>info@elegante.se</p>
          <p>08-123 45 67</p>
        </div>
      </div>
    </section>
    </>
  );
}
