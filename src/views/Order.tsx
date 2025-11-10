import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

type Order = {
  id: string;
  status?: string;
  lines?: { name: string; quantity: number; price: number }[];
  total: number;
};

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const displayCode = useMemo(() => {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('code');
    // Prefer code from URL or navigation state; fallback to id
    return (location.state as any)?.shortId || qp || id || '';
  }, [location.state, id]);

  useEffect(() => {
    let mounted = true;
    const backendId = (location.state as any)?.backendId as string | undefined;
    const toFetch = backendId && typeof backendId === 'string' ? backendId : undefined;
    if (toFetch) {
      api.getOrder(toFetch)
        .then(o => { if (mounted) setOrder(o); })
        .catch(err => console.warn('Order fetched by backend id failed (showing client code only):', err));
    }
    return () => { mounted = false; };
  }, [location.state]);

  return (
    <div className="container">
      <h1>Order {displayCode ? `#${displayCode}` : ''}</h1>
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
