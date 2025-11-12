import { useEffect, useMemo, useState } from 'react';

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
  const [orders, setOrders] = useState<KOrder[]>(seed);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const n = new Date();
    setLastUpdated(n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const stats = useMemo(() => ({
    new: orders.filter(o => o.status === 'new').length,
    inprogress: orders.filter(o => o.status === 'inprogress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    total: orders.length,
  }), [orders]);

  const refresh = () => {
    const n = new Date();
    setLastUpdated(n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const accept = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'inprogress', etaMin: 10 } : o));
  const markReady = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'ready', etaMin: undefined } : o));
  const markDelivered = (id: string) => setOrders(os => os.map(o => o.id === id ? { ...o, status: 'delivered' } : o));

  const Section = ({ title, filter, action }: { title: string; filter: KOrder['status']; action?: (id: string) => void }) => {
    const list = orders.filter(o => o.status === filter);
    const colorClass = filter === 'new' ? 'orange' : filter === 'inprogress' ? 'blue' : 'yellow';

    return (
      <section className="k-section">
        <div className="k-section-head">
          <h3>{title}</h3>
          <span className="muted">{list.length} ordrar</span>
        </div>
        <div className="k-cards">
          {list.map(o => (
            <article key={o.id} className={`k-card ${colorClass}`}>
              <header className="k-card-head">
                <span className={`k-tag ${colorClass}`}>#{o.id}</span>
                <span className="muted">{filter === 'inprogress' && o.etaMin != null ? `${o.etaMin} min` : o.createdAt}</span>
              </header>
              <div className="k-card-body">
                {o.lines.map((l, i) => (
                  <div key={i} className="k-line">
                    <span className="k-line-name">{l.name} x{l.quantity}</span>
                  </div>
                ))}
                <div className="k-total muted">Totalt: {o.lines.reduce((s, l) => s + l.quantity, 0)} pizzor</div>
                {filter === 'inprogress' && o.etaMin != null && (
                  <div className="k-progress">
                    <span className="k-pill blue">{o.etaMin} min kvar</span>
                    <button className="k-okay" title="Klar" onClick={() => action && action(o.id)}>{'\u2713'}</button>
                  </div>
                )}
              </div>
              {action && (
                <footer className="k-card-foot">
                  <button className={`btn ${filter === 'new' ? 'k-accept' : filter === 'ready' ? 'k-send' : ''}`} onClick={() => action(o.id)}>
                    {filter === 'new' ? 'Acceptera order' : filter === 'inprogress' ? 'Markera som redo' : 'Skicka f\u00F6r leverans'}
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="container">
      <div className="k-head">
        <div className="k-head-left">
          <h1>Kökssida</h1>
          <span className="muted">Aktiva ordrar: <strong>{stats.total}</strong></span>
        </div>
        <div className="k-head-right">
          <button className="btn" onClick={refresh}>Uppdatera</button>
          <span className="muted">Senast uppdaterad <strong>{lastUpdated}</strong></span>
        </div>
      </div>

      <div className="k-stats">
        <div className="k-stat orange">
          <div className="k-stat-head">
            <span>Nya ordrar</span>
            <span className="k-badge">{stats.new}</span>
          </div>
          <div className="k-stat-value">{stats.new}</div>
          <div className="k-stat-sub">Väntar på bekräftelse</div>
        </div>
        <div className="k-stat blue">
          <div className="k-stat-head">
            <span>Pågående</span>
            <span className="k-badge">{stats.inprogress}</span>
          </div>
          <div className="k-stat-value">{stats.inprogress}</div>
          <div className="k-stat-sub">Under tillagning</div>
        </div>
        <div className="k-stat yellow">
          <div className="k-stat-head">
            <span>Redo</span>
            <span className="k-badge">{stats.ready}</span>
          </div>
          <div className="k-stat-value">{stats.ready}</div>
          <div className="k-stat-sub">Väntar på leverans</div>
        </div>
        <div className="k-stat green">
          <div className="k-stat-head">
            <span>Levererade</span>
            <span className="k-badge">{stats.delivered}</span>
          </div>
          <div className="k-stat-value">{stats.delivered}</div>
          <div className="k-stat-sub">Idag</div>
        </div>
      </div>

      <div className="k-board">
        <Section title="Nya ordrar" filter="new" action={accept} />
        <Section title="Pågånde" filter="inprogress" action={markReady} />
        <Section title="Redo för leverens" filter="ready" action={markDelivered} />
      </div>
    </div>
  );
}




