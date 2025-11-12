import { useMemo, useState } from 'react';
import '../admin.css';

type Order = { id: string; table: number; time: string; total: number; status: 'Klar' | 'Tillagning' | 'Ny' };
type Reservation = { id: string; name: string; time: string; guests: number };
type MenuItem = { id: string; name: string; desc: string; price: number; active: boolean };

const seedOrders: Order[] = [
  { id: '12847', table: 7, time: '14:32', total: 485, status: 'Klar' },
  { id: '12846', table: 3, time: '14:28', total: 320, status: 'Tillagning' },
  { id: '12845', table: 12, time: '14:25', total: 680, status: 'Ny' }
];

const seedReservations: Reservation[] = [
  { id: 'r1', name: 'Anna Andersson', time: '18:00', guests: 4 },
  { id: 'r2', name: 'Erik Johansson', time: '19:30', guests: 2 },
  { id: 'r3', name: 'Maria Larsson', time: '20:15', guests: 6 }
];

const seedMenu: MenuItem[] = [
  { id: 'm1', name: 'Grillad lax', desc: 'Med citronsmör och grönsaker', price: 285, active: true },
  { id: 'm2', name: 'Pasta Carbonara', desc: 'Klassisk italiensk pasta', price: 195, active: true },
  { id: 'm3', name: 'Entrecôte', desc: '250g med bearnaisesås', price: 345, active: false }
];

export default function Admin() {
  const [orders] = useState<Order[]>(seedOrders);
  const [reservations] = useState<Reservation[]>(seedReservations);
  const [menu] = useState<MenuItem[]>(seedMenu);

  const stats = useMemo(() => ({
    todaysOrders: 127,
    activeReservations: 34,
    menuItems: 42,
  }), []);

  const StatIcon = ({ children }: { children: React.ReactNode }) => (
    <span className="stat-icon" aria-hidden>{children}</span>
  );

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

      {/* Stats */}
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

      {/* Lists */}
      <section className="dash-grid">
        <div className="card">
          <div className="card-head">
            <strong>Senaste beställningar</strong>
            <button className="btn"><span aria-hidden>👁️</span> Visa alla</button>
          </div>
          <ul className="list">
            {orders.map(o => (
              <li key={o.id} className="row">
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
            <button className="btn primary">+ Ny reservation</button>
          </div>
          <ul className="list">
            {reservations.map(r => (
              <li key={r.id} className="row">
                <div>
                  <div className="row-title">{r.name}</div>
                  <div className="muted">{r.guests} personer • {r.time}</div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Redigera" aria-label={`Redigera ${r.name}`}>✏️</button>
                  <button className="icon-btn" title="Ta bort" aria-label={`Ta bort ${r.name}`}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Menu management */}
      <section className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <strong>Menyhantering</strong>
          <button className="btn primary">+ Lägg till rätt</button>
        </div>
        <div className="menu-admin-grid">
          {menu.map(m => (
            <article key={m.id} className="menu-admin-card">
              <div className="menu-admin-top">
                <strong>{m.name}</strong>
                <div className="menu-admin-actions">
                  <button className="icon-btn" title={`Redigera ${m.name}`}>✏️</button>
                  <button className="icon-btn" title={`Ta bort ${m.name}`}>🗑️</button>
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
