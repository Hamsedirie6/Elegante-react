import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Reservation() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });
  const [activeTab, setActiveTab] = useState<'book' | 'mine'>('book');
  const [reservations, setReservations] = useState<any[] | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const times = ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      await api.createReservation(form);
      setSaved(true);
      // Visa bokningen direkt under "Mina bokningar"
      setActiveTab('mine');
      await refreshReservations();
    } catch (err: any) {
      const msg = err?.message || '';
      setSubmitError(typeof msg === 'string' ? msg : 'Något gick fel vid bokning');
    } finally {
      setLoading(false);
    }
  };

  const updateGuests = (delta: number) => {
    setForm(f => ({ ...f, guests: Math.max(1, Math.min(20, f.guests + delta)) }));
  };

  const refreshReservations = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await api.getReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = err?.message || '';
      if (typeof msg === 'string' && msg.includes('API 403')) {
        setListError('Du beh ver vara inloggad f r att se dina bokningar.');
      } else {
        setListError('Kunde inte h mta bokningar');
      }
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mine' && reservations === null && !listLoading) {
      refreshReservations();
    }
  }, [activeTab]);

  return (
    <div className="login-layout">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-logo" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3C6.44772 3 6 3.44772 6 4V10C6 10.5523 5.55228 11 5 11V21C5 21.5523 5.44772 22 6 22C6.55228 22 7 21.5523 7 21V12H8V21C8 21.5523 8.44772 22 9 22C9.55228 22 10 21.5523 10 21V11C9.44772 11 9 10.5523 9 10V4C9 3.44772 8.55228 3 8 3H7Z" fill="white"/>
              <path d="M17 3C15.3431 3 14 4.34315 14 6V21C14 21.5523 14.4477 22 15 22C15.5523 22 16 21.5523 16 21V14H18V21C18 21.5523 18.4477 22 19 22C19.5523 22 20 21.5523 20 21V6C20 4.34315 18.6569 3 17 3Z" fill="white"/>
            </svg>
          </div>
          <h2 className="login-brand">Restaurang Elegante</h2>
          <p className="login-subtitle">V lkommen till v rt restaurangsystem</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card res-item" style={{ minHeight: 560 }}>
          <div className="res-tabs">
            <button type="button" className={"btn" + (activeTab === 'book' ? ' primary' : '')} onClick={() => setActiveTab('book')}>Boka bord</button>
            <button type="button" className={"btn" + (activeTab === 'mine' ? ' primary' : '')} onClick={() => setActiveTab('mine')}>Mina bokningar</button>
          </div>
          <div style={{ display: activeTab === 'book' ? 'block' : 'none' }}>
          <h3 className="login-card-title">Boka ditt bord</h3>

          {saved ? (
            <p className="status-ok">Tack! Din bokning  r mottagen.</p>
          ) : (
            <form onSubmit={submit}>
              <div className="res-grid">
                <div className="form-group">
                  <label className="form-label">Datum</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tid</label>
                  <select
                    className="form-input"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    required
                  >
                    <option value="">V lj tid</option>
                    {times.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group res-row">
                <label className="form-label">Antal g ster</label>
                <div className="guest-stepper">
                  <button
                    type="button"
                    className="stepper-button minus"
                    onClick={() => updateGuests(-1)}
                    aria-label="Minska"
                  >
                     
                  </button>
                  <div className="guest-value" aria-live="polite">{form.guests}</div>
                  <button
                    type="button"
                    className="stepper-button plus"
                    onClick={() => updateGuests(1)}
                    aria-label=" ka"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="res-grid">
                <div className="form-group">
                  <label className="form-label">Namn</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Anteckningar</label>
                <textarea
                  className="form-input"
                  style={{ height: 120 }}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Allergier, special nskem l eller andra anteckningar "
                />
              </div>

              {submitError && (
                <p className="status-error" role="alert">{submitError}</p>
              )}

              <div className="res-footer">
                <a href="/" className="btn">Avbryt</a>
                <button className="btn primary" disabled={loading}>
                  {loading ? 'Skickar...' : 'Bekräfta bokning'}
                </button>
              </div>
            </form>
          )}
          </div>
          <div className="mine-section" style={{ display: activeTab === 'mine' ? 'block' : 'none' }}>
            <h3 className="login-card-title">Mina bokningar</h3>
            {listLoading && <p>Laddar </p>}
            {listError && <p className="status-error">{listError}</p>}
            {!listLoading && !listError && (
              <>
                {reservations && reservations.length === 0 && (
                  <p>Inga bokningar hittades.</p>
                )}
                <div className="res-list">
                  {(reservations || []).map((r: any) => {
                    const pick = (...paths: string[]) => {
                      for (const p of paths) {
                        const segs = p.split('.');
                        let cur: any = r;
                        for (const s of segs) { cur = cur?.[s]; if (cur == null) break; }
                        if (cur != null && cur !== '') return cur;
                      }
                      return undefined;
                    };
                    const date = pick('date','Date','content.Date','content.Reservation.Date','content.Booking.Date','Date.Value','content.Date.Value','content.Reservation.Date.Value') || '';
                    const time = pick('time','Time','content.Time','content.Reservation.Time','content.Booking.Time','Time.Value','content.Time.Value','content.Reservation.Time.Value') || '';
                    const guests = pick('guests','Guests','content.Guests','content.Reservation.Guests','content.Booking.Guests','Guests.Value','content.Guests.Value','content.Reservation.Guests.Value');
                    const name = pick('name','Name','content.Name','content.Reservation.Name') || '';
                    const phone = pick('phone','Phone','content.Phone','content.Reservation.Phone') || '';
                    const notes = pick('notes','Notes','content.Notes','content.Reservation.Notes') || '';
                    const created = pick('createdUtc','CreatedUtc') || '';
                    return (
                      <div key={r.id || r.contentItemId || Math.random()} className="res-item">
                        <div className="res-item-head">
                          <div className="res-item-when"><strong>{date}</strong> {time}</div>
                          <div className="res-item-guests">{guests} gäster</div>
                        </div>
                        <div className="res-item-body">
                          {(name || phone) && (
                            <div className="res-row"><span className="label">Kontakt:</span> <span>{name}{phone ? `, ${phone}` : ''}</span></div>
                          )}
                          {notes && (
                            <div className="res-row"><span className="label">Notering:</span> <span>{notes}</span></div>
                          )}
                        </div>
                        {created && <div className="res-item-foot"><span className="muted">Skapad:</span> {created}</div>}
                      </div>
                    );
                  })}
                </div>
                <div className="res-actions">
                  <button className="btn" onClick={refreshReservations}>Uppdatera</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




