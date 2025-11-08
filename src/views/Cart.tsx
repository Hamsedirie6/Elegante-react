import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, total, setQuantity, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Varukorg</h1>
        <p>Din varukorg är tom. <Link to="/menu">Gå till menyn</Link></p>
      </div>
    );
  }

  return (
    <section className="cart-section">
      <div className="container">
        <h1 className="cart-title">Varukorg</h1>
        <div className="cart-card">
          <ul className="cart-list">
          {items.map(i => (
            <li className="cart-row" key={i.id}>
              <div className="cell name">{i.name}</div>
              <div className="cell price">{i.price} kr</div>
              <div className="cell qty">
                <div className="qty-stepper">
                  <button className="stepper-button minus" onClick={() => setQuantity(i.id, Math.max(0, i.quantity - 1))} aria-label="Minska">–</button>
                  <div className="qty-value" aria-live="polite">{i.quantity}</div>
                  <button className="stepper-button plus" onClick={() => setQuantity(i.id, i.quantity + 1)} aria-label="Öka">+</button>
                </div>
              </div>
              <div className="cell subtotal"><strong>{i.price * i.quantity} kr</strong></div>
              <div className="cell actions"><button className="btn" onClick={() => remove(i.id)}>Ta bort</button></div>
            </li>
          ))}
        </ul>

        <div className="cart-footer">
          <div className="cart-total"><strong>Totalt: {total} kr</strong></div>
          <div className="cart-actions">
            <button className="btn" onClick={clear}>Töm</button>
            <Link className="btn primary" to="/kassa">Gå till betalning</Link>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
