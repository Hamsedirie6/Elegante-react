import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../admin.css';

type Order = { id: string; table: number; time: string; total: number; status: 'Klar' | 'Tillagning' | 'Ny' };
type Reservation = { id: string; name: string; time: string; guests: number };
type MenuItem = { id: string; name: string; desc: string; price: number; active: boolean };

export default function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => ({
    todaysOrders: orders.length,
    activeReservations: reservations.length,
    menuItems: menu.length,
  }), [orders, reservations, menu]);

  const StatIcon = ({ children }: { children: React.ReactNode }) => (
    <span className="stat-icon" aria-hidden>{children}</span>
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [exp, raw, res, menuItems] = await Promise.all([
          api.getOrdersExpanded().catch(() => []),
          api.getOrdersRaw().catch(() => []),
          api.getAllReservations().catch(() => []),
          api.getMenu().catch(() => []),
        ]);

        type RawOrder = { ContentItemId?: string; CreatedUtc?: string } & Record<string, any>;
        const timeById: Record<string, string> = {};
        (raw as RawOrder[]).forEach(r => {
          const id = (r as any)?.ContentItemId as string | undefined;
          const created = (r as any)?.CreatedUtc as string | undefined;
          if (id && created) timeById[id] = created;
        });

        const toTime = (iso?: string) => {
          if (!iso) return '';
          try { const d = new Date(iso); return d.toTimeString().slice(0,5); } catch { return ''; }
        };

        const mappedOrders: Order[] = (exp as any[])
          .map(o => ({
            id: String(o.id || ''),
            table: Number(o.table || 0) || 0,
            time: toTime(timeById[String(o.id || '')]),
            total: Number(o.total || 0) || 0,
            status: (String(o.status || 'Ny') as Order['status'])
          }))
          .sort((a,b) => (b.time||'').localeCompare(a.time||''));

        const mappedRes: Reservation[] = (res as any[]).slice(0, 3).map(r => ({
          id: String(r.id || ''),
          name: String(r.name || r.title || ''),
          time: String(r.time || r.Time || ''),
          guests: Number(r.guests || r.Guests || 0) || 0,
        }));

        const mappedMenu: MenuItem[] = (menuItems as any[]).map(m => ({
          id: String(m.id || ''),
          name: String(m.name || m.title || ''),
          desc: String(m.description || m.desc || m.subTitle || ''),
          price: Number(m.price || 0) || 0,
          active: Boolean((m.active ?? true)),
        }));

        if (!mounted) return;
        setOrders(mappedOrders);
        setReservations(mappedRes);
        setMenu(mappedMenu);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container">
      <header className="dash-head">
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <div className="muted">Översikt av restaurangverksamhet</div>
        </div>
        <div className="dash-actions">
          <button className="icon-btn" title="Aviseringar" aria-label="Aviseringar">🔔</button>
          <div className="avatar" aria-hidden>GA</div>
        </div>
      </header>

      <section className="dash-stats">
        <div className="stat">
          <div className="stat-head">
            <span className="muted">Dagens beställningar</span>
            <StatIcon>🗓️</StatIcon>
          </div>
          <div className="stat-value">{stats.todaysOrders}</div>
        </div>
        <div className="stat">
          <div className="stat-head">
            <span className="muted">Aktiva reservationer</span>
            <StatIcon>📅</StatIcon>
          </div>
          <div className="stat-value">{stats.activeReservations}</div>
        </div>
        <div className="stat">
          <div className="stat-head">
            <span className="muted">Menyrätter</span>
            <StatIcon>🍽️</StatIcon>
          </div>
          <div className="stat-value">{stats.menuItems}</div>
        </div>
      </section>

      <section className="dash-grid">
        <div className="card">
          <div className="card-head">
            <strong>Senaste beställningar</strong>
            <button className="btn" onClick={() => navigate('/kok')}><span aria-hidden>👁️</span> Visa alla</button>
          </div>
          <ul className="list">
            {(loading && orders.length === 0) && (
              <li className="row"><span className="muted">Laddar ordrar…</span></li>
            )}
            {orders.slice(0, 5).map(o => (
              <li key={o.id} className="row" role="button" onClick={() => navigate(`/order/${o.id}`, { state: { backendId: o.id } })}>
                <div>
                  <div className="row-title">#{o.id}</div>
                  <div className="muted">Bord {o.table} • {o.time}</div>
                </div>
                <div className="row-amt">{o.total} kr</div>
                <span className={
                  o.status === 'Klar' ? 'chip green' : o.status === 'Tillagning' ? 'chip amber' : 'chip blue'}
                >{o.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-head">
            <strong>Dagens reservationer</strong>
            <button className="btn primary" onClick={() => navigate('/boka-bord')}>+ Ny reservation</button>
          </div>
          <ul className="list">
            {(loading && reservations.length === 0) && (
              <li className="row"><span className="muted">Laddar reservationer…</span></li>
            )}
            {reservations.map(r => (
              <li key={r.id} className="row">
                <div>
                  <div className="row-title">{r.name}</div>
                  <div className="muted">{r.guests} personer • {r.time}</div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Redigera" aria-label={`Redigera ${r.name}`} onClick={() => navigate('/boka-bord')}>✏️</button>
                  <button className="icon-btn" title="Ta bort" aria-label={`Ta bort ${r.name}`} onClick={() => alert('Ta bort-reservation implementeras i nästa steg')}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <strong>Menyhantering</strong>
          <button className="btn primary" onClick={() => alert('Lägg till rätt – implementeras i nästa steg')}>+ Lägg till rätt</button>
        </div>
        <div className="menu-admin-grid">
          {menu.map(m => (
            <article key={m.id} className="menu-admin-card">
              <div className="menu-admin-top">
                <strong>{m.name}</strong>
                <div className="menu-admin-actions">
                  <button className="icon-btn" title={`Redigera ${m.name}`} onClick={() => alert('Redigera – implementeras i nästa steg')}>✏️</button>
                  <button className="icon-btn" title={`Ta bort ${m.name}`} onClick={() => alert('Ta bort – implementeras i nästa steg')}>🗑️</button>
                </div>
              </div>
              <div className="muted">{m.desc}</div>
              <div className="menu-admin-foot">
                <strong>{m.price} kr</strong>
                <span className={m.active ? 'chip green' : 'chip gray'}>{m.active ? 'Aktiv' : 'Slut'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

