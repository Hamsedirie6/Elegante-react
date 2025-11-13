import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { getOrder as getLocalOrder, subscribe as subscribeOrders } from '../store/orderStore';

type Order = {
  id: string;
  status?: string;
  lines?: { name: string; quantity: number; price?: number }[];
  total: number;
};

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [localStatus, setLocalStatus] = useState<string | undefined>(undefined);
  const [localLines, setLocalLines] = useState<{ name: string; quantity: number; price?: number }[]>([]);
  const [localTotal, setLocalTotal] = useState<number | undefined>(undefined);

  const displayCode = useMemo(() => {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('code');
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

  useEffect(() => {
    if (!displayCode) return;
    const apply = () => {
      const lo = getLocalOrder(displayCode);
      setLocalStatus(lo?.status);
      setLocalLines(lo?.lines || []);
      setLocalTotal(lo?.total);
    };
    apply();
    return subscribeOrders(apply);
  }, [displayCode]);

  const status = localStatus || order?.status || 'new';
  const step = status === 'delivered' ? 3 : status === 'ready' ? 2 : status === 'inprogress' ? 1 : 0;
  const lines = (localLines?.length ? localLines : (order?.lines || [])).map(l => ({ name: l.name, quantity: l.quantity, price: (l as any).price }));
  const totalAmount = localTotal ?? order?.total;
  const sek = (n: number) => new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(n));

  const progress = (
    <section style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>Order Status</div>
      <div style={{ position: 'relative', padding: '12px 0 4px' }}>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999 }} />
        <div style={{ height: 6, background: '#c53030', borderRadius: 999, width: `${step >= 3 ? 100 : step === 2 ? 66 : step === 1 ? 33 : 0}%`, position: 'relative', marginTop: -6 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 12 }}>
        {[
          { title: 'Accepterad', sub: 'Order confirmed' },
          { title: 'Tillagas', sub: 'Förbereds' },
          { title: 'Ute för leverans', sub: '' }
        ].map((t, i) => {
          const completed = step > i;
          const active = step === i + 1 || (i === 0 && step === 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: completed || active ? '#c53030' : '#e5e7eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {completed ? '✓' : active ? '•' : ''}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: completed || active ? '#c53030' : '#94a3b8' }}>{t.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{t.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
        <h1 style={{ margin: 0 }}>Order {displayCode ? `#${displayCode}` : ''}</h1>
      </div>

      <section style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="muted">Estimerad leverans tid</div>
          <div style={{ color: '#c53030', fontSize: 26, fontWeight: 800 }}>25-30 min</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted">Levereras till</div>
          <strong>Storgatan 23</strong>
        </div>
      </section>

      {progress}

      <section style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Ordersammanfattning</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f1f1', paddingBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{l.name}</div>
                <div className="muted">x{l.quantity}</div>
              </div>
              {typeof l.price === 'number' && <div>{sek(l.price * l.quantity)} kr</div>}
            </div>
          ))}
          {typeof totalAmount === 'number' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <strong>Total summa:</strong>
              <strong>{sek(totalAmount)} kr</strong>
            </div>
          )}
        </div>
      </section>

      <p style={{ marginTop: 12 }}><Link to="/">Till startsidan</Link></p>
    </div>
  );
}

