import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [paying, setPaying] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPaying(true);
    try {
      const result = await api.createOrder({
        customer: { name, address },
        lines: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        total,
      });
      clear();
      const id = result?.id ?? 'ok';
      navigate(`/order/${id}`);
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container">
      <h1>Kassa</h1>
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section>
          <h3>Ordersammanfattning</h3>
          {items.length === 0 ? (
            <p>Varukorgen är tom.</p>
          ) : (
            <ul className="cart-list">
              {items.map(i => (
                <li className="cart-row" key={i.id}>
                  <span>{i.name}</span>
                  <span>{i.quantity} st</span>
                  <strong>{i.price * i.quantity} kr</strong>
                </li>
              ))}
            </ul>
          )}
          <div className="total">
            <strong>Totalt:</strong>
            <strong>{total} kr</strong>
          </div>
        </section>
        <section>
          <h3>Betalning</h3>
          <form className="form" onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Namn</label>
              <input
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Adress</label>
              <input
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <button className="btn primary" type="submit" disabled={paying}>
              {paying ? 'Betalar...' : 'Betala'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}