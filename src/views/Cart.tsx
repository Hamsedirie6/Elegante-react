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
    <div className="container">
      <h1>Varukorg</h1>
      <ul className="cart-list">
        {items.map(i => (
          <li className="cart-row" key={i.id}>
            <span>{i.name}</span>
            <span>{i.price} kr</span>
            <div className="qty">
              <button className="btn" onClick={() => setQuantity(i.id, i.quantity - 1)}>-</button>
              <input
                type="number"
                min={0}
                value={i.quantity}
                onChange={e => setQuantity(i.id, Math.max(0, Number(e.target.value) || 0))}
              />
              <button className="btn" onClick={() => setQuantity(i.id, i.quantity + 1)}>+</button>
            </div>
            <strong>{i.price * i.quantity} kr</strong>
            <button className="btn" onClick={() => remove(i.id)}>Ta bort</button>
          </li>
        ))}
      </ul>

      <div className="total">
        <strong>Totalt: {total} kr</strong>
        <button className="btn" onClick={clear}>Töm</button>
        <Link className="btn primary" to="/kassa">Gå till betalning</Link>
      </div>
    </div>
  );
}