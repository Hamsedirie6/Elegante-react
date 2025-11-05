import { useMemo, useState } from 'react';

type Order = { id: string; total: number; time: string; status: 'betald' | 'pågår' | 'redo' };
type Reservation = { id: string; name: string; time: string; guests: number };
type MenuItem = { id: string; name: string; price: number; active: boolean };

const seedOrders: Order[] = [
  { id: '12753', total: 439, time: '12:30', status: 'betald' },
  { id: '12754', total: 320, time: '13:05', status: 'pågår' },
  { id: '12755', total: 890, time: '13:20', status: 'redo' }
];

const seedReservations: Reservation[] = [
  { id: 'r1', name: 'Anna Andersson', time: '18:00', guests: 2 },
  { id: 'r2', name: 'Erik Johansson', time: '19:15', guests: 4 },
  { id: 'r3', name: 'Maria Larsson', time: '20:00', guests: 3 }
];

const seedMenu: MenuItem[] = [
  { id: 'm1', name: 'Gnocchi', price: 285, active: true },
  { id: 'm2', name: 'Pasta Carbonara', price: 195, active: true },
  { id: 'm3', name: 'Bruschetta', price: 145, active: false }
];

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [reservations] = useState<Reservation[]>(seedReservations);
  const [menu, setMenu] = useState<MenuItem[]>(seedMenu);

  const stats = useMemo(() => ({
    totalOrdersToday: 127,
    activeOrders: 34,
    reservationsToday: 42,
  }), []);

  const toggleItem = (id: string) => setMenu(ms => ms.map(m => m.id === id ? { ...m, active: !m.active } : m));

  return (
    <div className="container">
      <h1>Admin – Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 12 }}>
          <div className="muted">Dagens beställningar</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalOrdersToday}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 12 }}>
          <div className="muted">Aktiva beställningar</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.activeOrders}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12, padding: 12 }}>
          <div className="muted">Reservationer</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.reservationsToday}</div>
        </div>
      </div>

      {/* Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12 }}>
          <header style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Senaste beställningar</strong>
            <button className="btn">Visa alla</button>
          </header>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {orders.map(o => (
              <li key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: 12, borderTop: '1px solid var(--border)' }}>
                <span>#{o.id} · {o.time}</span>
                <span className="muted">{o.status}</span>
                <strong>{o.total} kr</strong>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ border: '1px solid var(--border)', background: '#fff', borderRadius: 12 }}>
          <header style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Dagens reservationer</strong>
            <button className="btn primary">Ny reservation</button>
          </header>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {reservations.map(r => (
              <li key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: 12, borderTop: '1px solid var(--border)' }}>
                <div>
                  <strong>{r.name}</strong>
                  <div className="muted">{r.time} · {r.guests} pers</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn">✎</button>
                  <button className="btn">🗑</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Menu management */}
      <section style={{ marginTop: 18, border: '1px solid var(--border)', background: '#fff', borderRadius: 12 }}>
        <header style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Menystyrning</strong>
          <button className="btn primary">+ Lägg till rätt</button>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, padding: 12 }}>
          {menu.map(m => (
            <article key={m.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{m.name}</strong>
                <span>{m.price} kr</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn">Redigera</button>
                <button className="btn" onClick={() => toggleItem(m.id)}>
                  {m.active ? 'Inaktivera' : 'Aktivera'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

