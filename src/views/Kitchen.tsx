import { useMemo, useState } from 'react';

type Line = { name: string; quantity: number };
type KOrder = {
  id: string;
  createdAt: string; // HH:mm
  etaMin?: number; // minutes left
  status: 'new' | 'inprogress' | 'ready' | 'delivered';
  lines: Line[];
};

const seed: KOrder[] = [
  { id: '1247', createdAt: '14:28', status: 'new', lines: [ { name: 'Margherita', quantity: 2 }, { name: 'Pepperoni', quantity: 1 } ] },
  { id: '1248', createdAt: '14:31', status: 'new', lines: [ { name: 'Quattro Stagioni', quantity: 1 }, { name: 'Capricciosa', quantity: 1 } ] },
  { id: '1245', createdAt: '14:20', status: 'inprogress', etaMin: 8, lines: [ { name: 'Hawaiian', quantity: 2 } ] },
  { id: '1244', createdAt: '14:15', status: 'inprogress', etaMin: 5, lines: [ { name: 'Vegetariana', quantity: 1 }, { name: 'Marinara', quantity: 2 } ] },
  { id: '1243', createdAt: '14:12', status: 'ready', lines: [ { name: 'Carbonara', quantity: 1 } ] }
];

export default function Kitchen() {
  const [orders, setOrders] = useState<KOrder[]>(seed);

  const stats = useMemo(() => ({
    new: orders.filter(o => o.status === 'new').length,
    inprogress: orders.filter(o => o.status === 'inprogress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    total: orders.length,
  }), [orders]);

  const accept = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'inprogress', etaMin: 10 } : o));
  const markReady = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'ready', etaMin: undefined } : o));
  const markDelivered = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'delivered' } : o));

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

      {/* Top stats */}
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

