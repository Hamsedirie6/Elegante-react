import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

function sek(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function Checkout() {
  const { items, total, clear, setQuantity } = useCart();
  const navigate = useNavigate();

  const shipping = useMemo(() => (items.length > 0 ? 89 : 0), [items.length]);
  // Lower VAT (e.g., food 12%)
  const VAT_RATE = 0.12;
  const vat = useMemo(() => Math.round((total + shipping) * VAT_RATE), [total, shipping]);
  const grandTotal = useMemo(() => total + shipping + vat, [total, shipping, vat]);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [paying, setPaying] = useState(false);

  // Fallback: resolve images for items that lack them by loading the menu
  type Dish = { id: string; name: string; image?: string };
  const placeholder: Dish[] = [
    { id: '1', name: 'Bruschetta Classica', image: 'https://www.tastingtable.com/img/gallery/classic-bruschetta-recipe/intro-1642022550.jpg' },
    { id: '2', name: 'Pasta Carbonara', image: 'https://www.zeta.nu/app/uploads/2025/06/Pastacarbonara_liggande.webp' },
    { id: '3', name: 'Pizza Margherita', image: 'https://images.arla.com/recordid/17ADC8DB-DBC5-4DFA-AA85A07EEF36E4E7/pizza-margherita.jpg' },
    { id: '4', name: 'Grillad Lax', image: 'https://static.vecteezy.com/ti/gratis-foton/p1/65952590-elegant-grillad-lax-filea-eras-atop-kramig-mosad-potatisar-vackert-garnerad-i-en-varmtonad-restaurang-miljo-fotona.jpeg' },
    { id: '5', name: 'Risotto ai Funghi', image: 'https://images.getrecipekit.com/20250606114219-risotto-20mit-20pilzen-20produktbild.webp?aspect_ratio=1:1&quality=90&' },
    { id: '6', name: 'Tiramisu', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPcmHxSQ9j3leDWCnHISlloK8qmWl55PYCdQ&s' },
    { id: '7', name: 'Insalata Caprese', image: 'https://www.lilvienna.com/wp-content/uploads/Recipe-Classic-Italian-Caprese-Salad.jpg' },
    { id: '8', name: 'Gnocchi al Pesto', image: 'https://qbcucina.com/cdn/shop/articles/img-1713808789633_a37501db-2cb5-404a-9bff-eed4f8c45977_1200x.png?v=1713810591' },
    { id: '9', name: 'Panna Cotta', image: 'https://www.allrecipes.com/thmb/NlP50cO2BjJdN4uGvl5JhW0Rx2A=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AR-72567-Panna-cotta-ddmfs-4x3-14ae724a2a8e4ca3a79c5e27b2b61994.jpg' },
  ];
  const [imageById, setImageById] = useState<Record<string, string>>({});
  const [imageByName, setImageByName] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getMenu();
        const list: Dish[] = Array.isArray(data) && data.length
          ? (data as any[]).map(d => ({ id: String(d.id ?? ''), name: String(d.name ?? ''), image: d.image }))
          : placeholder;
        if (!active) return;
        const byId: Record<string, string> = {};
        const byName: Record<string, string> = {};
        for (const d of list) {
          if (d.id && d.image) byId[d.id] = d.image;
          if (d.name && d.image) byName[d.name] = d.image;
        }
        setImageById(byId);
        setImageByName(byName);
      } catch {
        // fallback to placeholder
        if (!active) return;
        const byId: Record<string, string> = {};
        const byName: Record<string, string> = {};
        for (const d of placeholder) {
          if (d.id && d.image) byId[d.id] = d.image;
          if (d.name && d.image) byName[d.name] = d.image;
        }
        setImageById(byId);
        setImageByName(byName);
      }
    })();
    return () => { active = false; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || paying) return;
    setPaying(true);
    const shortId = String(Math.floor(1000 + Math.random() * 9000));
    try {
      const result = await api.createOrder({
        customer: { name: cardName },
        lines: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total: grandTotal,
      });
      clear();
      // Always navigate using our klient-genererade 4-siffriga nummer
      navigate(`/order/${shortId}`, { state: { shortId, backendId: (result as any)?.id } });
    } catch (error) {
      console.warn('Order API failed, proceeding with local confirmation:', error);
      clear();
      navigate(`/order/${shortId}`, { state: { shortId } });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container">
      <div className="checkout-head">
        <h1>Betalning</h1>
      </div>

      <div className="checkout-layout">
        {/* Left: Order summary */}
        <section>
          <div className="section-title">
            <h2>Ordersammanfattning</h2>
            <div className="underline" />
          </div>

          <div className="summary-card">
            {items.length === 0 ? (
              <p className="muted">Varukorgen är tom.</p>
            ) : (
              <ul className="summary-list">
                {items.map(i => (
                  <li key={i.id} className="summary-row">
                    <div className="item">
                      {i.image || imageById[i.id] || imageByName[i.name] ? (
                        <img className="item-thumb" src={i.image || imageById[i.id] || imageByName[i.name]} alt="" aria-hidden />
                      ) : (
                        <div className="item-icon" aria-hidden />
                      )}
                      <div className="item-meta">
                        <div className="item-name">{i.name}</div>
                        <div className="item-qty">Antal: {i.quantity}</div>
                        <div className="qty-stepper checkout">
                          <button
                            type="button"
                            className="qty-btn minus"
                            aria-label="Minska"
                            onClick={() => setQuantity(i.id, Math.max(0, i.quantity - 1))}
                          >
                            –
                          </button>
                          <div className="qty-value" aria-live="polite">{i.quantity}</div>
                          <button
                            type="button"
                            className="qty-btn plus"
                            aria-label="Öka"
                            onClick={() => setQuantity(i.id, i.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="item-price">{sek(i.price * i.quantity)} kr</div>
                  </li>
                ))}
              </ul>
            )}

            <div className="sum-grid">
              <div className="sum-row">
                <span>Delsumma</span>
                <span>{sek(total)} kr</span>
              </div>
              <div className="sum-row">
                <span>Leverans</span>
                <span>{sek(shipping)} kr</span>
              </div>
              <div className="sum-row">
                <span>Moms</span>
                <span>{sek(vat)} kr</span>
              </div>
              <div className="sum-row total">
                <strong>Totalt summa</strong>
                <strong className="accent">{sek(grandTotal)} kr</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Payment */}
        <section>
          <div className="section-title">
            <h2>Betalning</h2>
          </div>

          <div className="pay-card">
            <div className="pay-methods">
              <button type="button" className="method active" aria-pressed="true">
                <span className="method-icon" aria-hidden>💳</span>
                Kreditkort
              </button>
            </div>

            <form onSubmit={submit} className="pay-form">
              <input
                className="form-input"
                placeholder="Kortinnehavarens namn"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                required
              />
              <input
                className="form-input"
                placeholder="Kortnummer"
                inputMode="numeric"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                required
              />
              <div className="pay-row">
                <input
                  className="form-input"
                  placeholder="MM/ÅÅ"
                  inputMode="numeric"
                  value={exp}
                  onChange={e => setExp(e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  placeholder="CVC"
                  inputMode="numeric"
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="form-button-full primary" disabled={paying || items.length === 0}>
                {paying ? 'Bearbetar…' : `Slutför betalning - ${sek(grandTotal)} kr`}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
