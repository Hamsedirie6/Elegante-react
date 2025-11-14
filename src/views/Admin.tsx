import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { StoredOrder, KitchenStatus } from '../store/orderStore';
import { getAll as getLocalOrders, subscribe as subscribeOrders } from '../store/orderStore';
import type { StoredReservation } from '../store/reservationStore';
import { getAll as getStoredReservations, subscribe as subscribeReservations } from '../store/reservationStore';
import '../admin.css';

type Order = { id: string; short?: string; table: number; time: string; total: number; status: 'Klar' | 'Tillagning' | 'Ny'; createdAt?: string };
type Reservation = { id: string; name: string; time: string; guests: number; createdAt?: string };
type MenuItem = { id: string; name: string; desc: string; price: number; active: boolean; image?: string };

const DEFAULT_MENU_ITEMS = 9;

const statusLabels: Record<KitchenStatus, Order['status']> = {
  new: 'Ny',
  inprogress: 'Tillagning',
  ready: 'Klar',
  delivered: 'Klar',
};

const formatTimeHM = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toTimeString().slice(0, 5);
  } catch {
    return '';
  }
};

const localOrderToView = (order: StoredOrder): Order => {
  const total = typeof order.total === 'number'
    ? order.total
    : (order.lines || []).reduce((sum, line) => sum + (line.price || 0) * line.quantity, 0);
  return {
    id: order.backendId || order.id,
    short: order.id,
    table: 0,
    time: formatTimeHM(order.updatedAt),
    total,
    status: statusLabels[order.status] || 'Ny',
    createdAt: order.updatedAt,
  };
};

const mergeOrders = (localOrders: StoredOrder[], remoteOrders: Order[]): Order[] => {
  const merged = new Map<string, Order>();
  remoteOrders.forEach(order => {
    const key = order.short || order.id;
    if (key) merged.set(key, order);
  });
  localOrders
    .map(localOrderToView)
    .forEach(order => {
      const key = order.short || order.id;
      if (!key) return;
      const existing = merged.get(key);
      merged.set(key, existing ? { ...existing, ...order } : order);
    });
  return Array.from(merged.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

const localReservationToView = (reservation: StoredReservation): Reservation => ({
  id: reservation.id,
  name: reservation.name,
  time: reservation.date ? `${reservation.date} ${reservation.time}` : reservation.time,
  guests: reservation.guests,
  createdAt: reservation.createdAt,
});

const mergeReservations = (localReservations: StoredReservation[], remoteReservations: Reservation[]): Reservation[] => {
  const merged = new Map<string, Reservation>();
  remoteReservations.forEach(res => {
    const key = res.id || `${res.name}-${res.time}`;
    merged.set(key, res);
  });
  localReservations
    .map(localReservationToView)
    .forEach(res => {
      const key = res.id || `${res.name}-${res.time}`;
      const existing = key ? merged.get(key) : undefined;
      merged.set(key, existing ? { ...existing, ...res } : res);
    });
  return Array.from(merged.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export default function Admin() {
  const navigate = useNavigate();
  const [localOrders, setLocalOrders] = useState<StoredOrder[]>(() => getLocalOrders());
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const orders = useMemo(() => mergeOrders(localOrders, remoteOrders), [localOrders, remoteOrders]);

  const [localReservations, setLocalReservations] = useState<StoredReservation[]>(() => getStoredReservations());
  const [remoteReservations, setRemoteReservations] = useState<Reservation[]>([]);
  const reservations = useMemo(
    () => mergeReservations(localReservations, remoteReservations),
    [localReservations, remoteReservations]
  );
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newDish, setNewDish] = useState({ name: '', desc: '', price: '', image: '' });
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const unsubOrders = subscribeOrders(() => setLocalOrders(getLocalOrders()));
    const unsubReservations = subscribeReservations(() => setLocalReservations(getStoredReservations()));
    return () => {
      unsubOrders?.();
      unsubReservations?.();
    };
  }, []);

  const stats = useMemo(() => ({
    todaysOrders: orders.length,
    activeReservations: reservations.length,
    menuItems: menu.length || DEFAULT_MENU_ITEMS,
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

        // map short client codes from local storage (joined via backendId)
        const shortByBackend: Record<string, string> = {};
        try {
          for (const lo of getLocalOrders()) {
            if (lo.backendId) shortByBackend[lo.backendId] = lo.id;
          }
        } catch {}

        const mappedOrders: Order[] = (exp as any[])
          .map(o => {
            const backendId = String(o.id || '');
            const createdAt = timeById[backendId];
            return {
              id: backendId,
              // 1) från localStorage-karta (backendId -> shortId)
              // 2) eller extrahera 4 siffror från orderns title
              short: (shortByBackend[backendId]
                || (typeof o.title === 'string' && (o.title.match(/(\d{4})/)?.[1] || undefined))) as string | undefined,
              table: Number(o.table || 0) || 0,
              time: toTime(createdAt),
              total: Number(o.total || 0) || 0,
              status: (String(o.status || 'Ny') as Order['status']),
              createdAt,
            };
          })
          .sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));

        const mappedRes: Reservation[] = (res as any[]).slice(0, 3).map(r => ({
          id: String(r.id || ''),
          name: String(r.name || r.title || ''),
          time: String(r.time || r.Time || ''),
          guests: Number(r.guests || r.Guests || 0) || 0,
          createdAt: String((r as any)?.CreatedUtc || (r as any)?.createdAt || '') || undefined,
        }));

        const mappedMenu: MenuItem[] = (menuItems as any[]).map(m => ({
          id: String(m.id || ''),
          name: String(m.name || m.title || ''),
          desc: String(m.description || m.desc || m.subTitle || ''),
          price: Number(m.price || 0) || 0,
          active: Boolean((m.active ?? true)),
          image: typeof m.image === 'string' ? m.image : (typeof m.mediaUrl === 'string' ? m.mediaUrl : undefined),
        }));

        if (!mounted) return;
        setRemoteOrders(mappedOrders);
        setRemoteReservations(mappedRes);
        setMenu(mappedMenu);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // När raderings-dialogen öppnas, hämta aktuell menylista så den inte är tom
  useEffect(() => {
    if (!showDelete) return;
    (async () => {
      try {
        let items = await api.getMenu();
        if (!Array.isArray(items) || items.length === 0) {
          // fallback to expanded variant if regular is empty
          items = await api.getMenuExpanded().catch(() => [] as any[]);
        }
        setMenu(Array.isArray(items) ? items.map((m: any) => ({
          id: String(m.id||''),
          name: String(m.name||m.title||''),
          desc: String(m.description||m.desc||m.subTitle||''),
          price: Number(m.price||0)||0,
          active: Boolean(m.active??true),
          image: typeof m.image === 'string' ? m.image : (typeof m.mediaUrl === 'string' ? m.mediaUrl : undefined),
        })) : []);
      } catch {}
    })();
  }, [showDelete]);

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
              <li key={o.id} className="row" role="button" onClick={() => navigate(`/order/${o.short || o.id}`, { state: { backendId: o.id, shortId: o.short } })}>
                <div>
                  <div className="row-title">#{o.short || o.id}</div>
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
        <div className="card-head" style={{ gap: 8 }}>
          <strong>Menyhantering</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn danger" onClick={() => setShowDelete(true)}>Radera rätt</button>
            <button className="btn success" onClick={() => setShowNew(true)}>+ Lägg till rätt</button>
          </div>
        </div>
        <div className="menu-admin-grid">
          {menu.map(m => (
            <article key={m.id} className="menu-admin-card">
              <div className="menu-admin-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {m.image && (
                    <img className="menu-admin-thumb" src={m.image} alt="" aria-hidden />
                  )}
                  <strong>{m.name}</strong>
                </div>
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

      {showNew && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-head">
              <strong>Lägg till ny rätt</strong>
              <button className="icon-btn" onClick={() => setShowNew(false)} aria-label="Stäng">✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Namn</label>
                <input className="form-input" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Beskrivning</label>
                <input className="form-input" value={newDish.desc} onChange={e => setNewDish({ ...newDish, desc: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Bild‑URL</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <input className="form-input" placeholder="https://...jpg/png/webp" value={newDish.image}
                         onChange={e => setNewDish({ ...newDish, image: e.target.value })} />
                  <button type="button" className="btn" onClick={async () => {
                    try { const t = await navigator.clipboard.readText(); if (t) setNewDish(d => ({ ...d, image: t })); } catch {}
                  }}>Klistra in</button>
                </div>
                {newDish.image && (
                  <div style={{ marginTop: 8 }}>
                    <img src={newDish.image} alt="Förhandsvisning" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Pris (kr)</label>
                <input className="form-input" inputMode="numeric" value={newDish.price} onChange={e => setNewDish({ ...newDish, price: e.target.value.replace(/[^0-9]/g, '') })} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setShowNew(false)}>Avbryt</button>
              <button className="btn primary" onClick={async () => {
                const payload = {
                  title: newDish.name || 'Untitled',
                  name: newDish.name,
                  description: newDish.desc,
                  price: Number(newDish.price || 0),
                  active: true,
                  image: newDish.image || undefined,
                };
                try {
                  await api.createMenuItem(payload);
                  const items = await api.getMenu();
                  setMenu(Array.isArray(items) ? items.map((m: any) => ({
                    id: String(m.id||''),
                    name: String(m.name||m.title||''),
                    desc: String(m.description||m.desc||m.subTitle||''),
                    price: Number(m.price||0)||0,
                    active: Boolean(m.active??true),
                    image: typeof m.image === 'string' ? m.image : (typeof m.mediaUrl === 'string' ? m.mediaUrl : undefined),
                  })) : []);
                  setShowNew(false);
                  setNewDish({ name: '', desc: '', price: '', image: '' });
                } catch (e) {
                  alert('Kunde inte spara rätten');
                }
              }}>Spara rätt</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal" style={{ width: 640 }}>
            <div className="modal-head">
              <strong>Radera rätt</strong>
              <button className="icon-btn" onClick={() => setShowDelete(false)} aria-label="Stäng">✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 420, overflow: 'auto' }}>
              {menu.length === 0 && <p className="muted">Inga rätter att radera.</p>}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {menu.map(m => (
                  <li key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {m.image && <img src={m.image} alt="" aria-hidden className="menu-admin-thumb" />}
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div className="muted">{m.price} kr</div>
                      </div>
                    </div>
                    <button
                      className="btn danger"
                      onClick={async () => {
                        if (deleting) return;
                        const ok = confirm(`Ta bort \"${m.name}\"?`);
                        if (!ok) return;
                        try {
                          setDeleting(m.id);
                          await api.deleteMenuItem(m.id);
                          const items = await api.getMenu();
                          setMenu(Array.isArray(items) ? items.map((x: any) => ({
                            id: String(x.id||''),
                            name: String(x.name||x.title||''),
                            desc: String(x.description||x.desc||x.subTitle||''),
                            price: Number(x.price||0)||0,
                            active: Boolean(x.active??true),
                            image: typeof x.image === 'string' ? x.image : (typeof x.mediaUrl === 'string' ? x.mediaUrl : undefined),
                          })) : []);
                        } catch {
                          alert('Kunde inte radera rätten');
                        } finally {
                          setDeleting(null);
                        }
                      }}
                      disabled={deleting === m.id}
                    >{deleting === m.id ? 'Raderar…' : 'Radera'}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setShowDelete(false)}>Stäng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
