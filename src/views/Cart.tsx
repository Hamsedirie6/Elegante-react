import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function sek(n: number) {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function Cart() {
  const { items, total, setQuantity, remove, clear } = useCart();

  const itemCount = items.length;
  const shipping = useMemo(() => (itemCount > 0 ? 89 : 0), [itemCount]);
  const grandTotal = useMemo(() => total + shipping, [total, shipping]);

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Varukorg</h1>
        <p>Din varukorg är tom. <Link to="/menu">Gå till menyn</Link></p>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <header className="cart-head">
          <h1>Varukorg</h1>
          <p className="muted">{itemCount} artiklar i din varukorg</p>
        </header>

        <div className="cart-layout">
          {/* Left: items list */}
          <div className="cart-items">
            {items.map(i => (
              <article className="cart-item" key={i.id}>
                {i.image ? (
                  <img className="cart-thumb" src={i.image} alt="" aria-hidden />
                ) : (
                  <div className="cart-thumb placeholder" aria-hidden />
                )}
                <div className="cart-meta">
                  <div className="cart-name">{i.name}</div>
                  <div className="cart-sub">Pris per styck</div>
                  <div className="cart-price">{sek(i.price)} kr</div>
                </div>
                <div className="cart-qty">
                  <button
                    className="cart-qty-btn"
                    aria-label="Minska"
                    onClick={() => setQuantity(i.id, Math.max(0, i.quantity - 1))}
                  >
                    –
                  </button>
                  <div className="cart-qty-val" aria-live="polite">{i.quantity}</div>
                  <button
                    className="cart-qty-btn"
                    aria-label="Öka"
                    onClick={() => setQuantity(i.id, i.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="cart-line-total">{sek(i.price * i.quantity)} kr</div>
                <button className="cart-delete" aria-label="Ta bort" onClick={() => remove(i.id)}>🗑️</button>
              </article>
            ))}

            <div className="cart-back">
              <Link to="/menu">← Fortsätt handla</Link>
            </div>
          </div>

          {/* Right: summary */}
          <aside className="cart-summary">
            <div className="summary-card">
              <div className="summary-head">Ordersammanfattning</div>
              <div className="sum-row"><span>Delsumma</span><span>{sek(total)} kr</span></div>
              <div className="sum-row"><span>Leverans</span><span>{sek(shipping)} kr</span></div>
              <div className="sum-sep" />
              <div className="sum-row total"><strong>Totalt</strong><strong className="accent">{sek(grandTotal)} kr</strong></div>
              <Link className="btn primary summary-cta" to="/kassa">Gå till betalning</Link>
              <button className="btn" style={{ width: '100%', marginTop: 8 }} onClick={clear}>Töm varukorg</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

