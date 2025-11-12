import { useEffect, useMemo, useState } from 'react';
import { getAll, subscribe as subscribeOrders, updateStatus } from '../store/orderStore';

type Line = { name: string; quantity: number };
type KOrder = {
  id: string;
  createdAt: string; // HH:mm
  etaMin?: number; // minutes left
  status: 'new' | 'inprogress' | 'ready' | 'delivered';
  lines: Line[];
};

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Kitchen() {
  const toKOrder = (o: ReturnType<typeof getAll>[number]): KOrder => ({
    id: o.id,
    createdAt: o.updatedAt ? new Date(o.updatedAt).toTimeString().slice(0,5) : nowHM(),
    status: o.status,
    lines: (o.lines || []).map(l => ({ name: l.name, quantity: l.quantity })),
  });

  const [orders, setOrders] = useState<KOrder[]>(() => getAll().map(toKOrder));

  useEffect(() => {
    const unsub = subscribeOrders(() => setOrders(getAll().map(toKOrder)));
    return unsub;
  }, []);

  const stats = useMemo(() => ({
    new: orders.filter(o => o.status === 'new').length,
    inprogress: orders.filter(o => o.status === 'inprogress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    total: orders.length,
  }), [orders]);

  const accept = (id: string) => { updateStatus(id, 'inprogress'); setOrders(os => os.map(o => o.id === id ? { ...o, status: 'inprogress', etaMin: 10 } : o)); };
  const markReady = (id: string) => { updateStatus(id, 'ready'); setOrders(os => os.map(o => o.id === id ? { ...o, status: 'ready', etaMin: undefined } : o)); };
  const markDelivered = (id: string) => { updateStatus(id, 'delivered'); setOrders(os => os.map(o => o.id === id ? { ...o, status: 'delivered' } : o)); };

  const Section = ({ title, filter, action }: { title: string; filter: KOrder['status']; action?: (id: string) => void }) => (
    <section style={{ marginTop: 18 }}>
      <h3 style={{ margin: '6px 0 12px' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16 }}>
        {orders.filter(o => o.status === filter).map(o => (
          <article key={o.id} style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,.04)' }}>
            <header style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <strong>#{o.id}</strong>
              <span className="muted">{o.createdAt}</span>
            </header>
            <div style={{ padding: 12, display: 'grid', gap: 6 }}>
              {o.lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{l.name} x{l.quantity}</span>
                </div>
              ))}
              {o.etaMin != null && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: '#2f6fed', color: '#fff', borderRadius: 8, padding: '6px 10px' }}>{o.etaMin} min kvar</div>
                </div>
              )}
            </div>
            {action && (
              <footer style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
                <button className={`btn ${filter === 'new' ? 'primary' : ''}`} onClick={() => action(o.id)}>
                  {filter === 'new' ? 'Acceptera order' : filter === 'inprogress' ? 'Markera som redo' : 'Skicka för leverans'}
                </button>
              </footer>
            )}
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Kökssida</h1>
        <div className="muted">Aktiva ordrar: <strong>{stats.total}</strong></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', padding: 12 }}>
          <div className="muted">Nya ordrar</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.new}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', padding: 12 }}>
          <div className="muted">Pågående</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.inprogress}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', padding: 12 }}>
          <div className="muted">Redo</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.ready}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', padding: 12 }}>
          <div className="muted">Levererade (idag)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.delivered}</div>
        </div>
      </div>

      <Section title="Nya ordrar" filter="new" action={accept} />
      <Section title="Pågående" filter="inprogress" action={markReady} />
      <Section title="Redo för leverans" filter="ready" action={markDelivered} />
    </div>
  );
}


