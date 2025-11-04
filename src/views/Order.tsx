import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

type Order = {
  id: string;
  status?: string;
  lines?: { name: string; quantity: number; price: number }[];
  total: number;
};

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let mounted = true;
    if (id) {
      api.getOrder(id)
        .then(o => { if (mounted) setOrder(o); })
        .catch(err => console.error('Failed to fetch order:', err));
    }
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="container">
      <h1>Order {id ? `#${id}` : ''}</h1>
      {order ? (
        <>
          <p>Status: {order.status ?? 'Mottagen'}</p>
          <ul>
            {(order.lines ?? []).map((l, idx) => (
              <li key={idx}>{l.name} × {l.quantity} – {l.price * l.quantity} kr</li>
            ))}
          </ul>
          <p><strong>Totalt: {order.total ?? 0} kr</strong></p>
        </>
      ) : (
        <p>Beställningen är mottagen.</p>
      )}
      <p><Link to="/">Till startsidan</Link></p>
    </div>
  );
}