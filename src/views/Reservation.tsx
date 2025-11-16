import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { addReservation as storeReservation } from '../store/reservationStore';

export default function Reservation() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });
  const [activeTab, setActiveTab] = useState<'book' | 'mine'>('book');
  const [reservations, setReservations] = useState<any[] | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const times = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      // Skickar rätt fältnamn (Booking-typen)
      await api.createReservation({
        title: `${form.date} ${form.time} – ${form.name} (${form.guests} gäster)`,
        CustomerName: form.name,
        PhoneNumber: form.phone,
        Date: form.date,
        Time: form.time,
        NumberOfGuests: form.guests,
        Notes: form.notes,
      });
      setSaved(true);

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
        setListError('Du behöver vara inloggad för att se dina bokningar.');
      } else {
        setListError('Kunde inte hämta bokningar');
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
              <path d="M7 3C6.44772 3 6 3.44772 6 4V10C6 10.5523 5.55228 11 5 11V21C5 21.5523 5.44772 22 6 22C6.55228 22 7 21.5523 7 21V12H8V21C8 21.5523 8.44772 22 9 22C9.55228 22 10 21.5523 10 21V11C9.44772 11 9 10.5523 9 10V4C9 3.44772 8.55228 3 8 3H7Z" fill="white" />
              <path d="M17 3C15.3431 3 14 4.34315 14 6V21C14 21.5523 14.4477 22 15 22C15.5523 22 16 21.5523 16 21V14H18V21C18 21.5523 18.4477 22 19 22C19.5523 22 20 21.5523 20 21V6C20 4.34315 18.6569 3 17 3Z" fill="white" />
            </svg>
          </div>
          <h2 className="login-brand">Restaurang Elegante</h2>
          <p className="login-subtitle">Välkommen till vårt restaurangsystem</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card" style={{ minHeight: 560 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={'btn' + (activeTab === 'book' ? ' primary' : '')}
              onClick={() => setActiveTab('book')}
            >
              Boka bord
            </button>
            <button
              type="button"
              className={'btn' + (activeTab === 'mine' ? ' primary' : '')}
              onClick={() => setActiveTab('mine')}
            >
              Mina bokningar
            </button>
          </div>

          {/* Boka bord */}
          <div style={{ display: activeTab === 'book' ? 'block' : 'none' }}>
            <h3 className="login-card-title">Boka ditt bord</h3>

            {saved ? (
              <p className="status-ok">Tack! Din bokning är mottagen.</p>
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
                      <option value="">Välj tid</option>
                      {times.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group res-row">
                  <label className="form-label">Antal gäster</label>
                  <div className="guest-stepper">
                    <button
                      type="button"
                      className="stepper-button minus"
                      onClick={() => updateGuests(-1)}
                      aria-label="Minska"
                    >
                      –
                    </button>
                    <div className="guest-value" aria-live="polite">{form.guests}</div>
                    <button
                      type="button"
                      className="stepper-button plus"
                      onClick={() => updateGuests(1)}
                      aria-label="Öka"
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
                    placeholder="Allergier, specialönskemål eller andra anteckningar…"
                  />
                </div>

                {submitError && (
                  <p className="status-error" role="alert">{submitError}</p>
                )}

                <div className="res-footer">
                  <a href="/" className="btn">Avbryt</a>
                  <button className="btn primary" disabled={loading}>
                    {loading ? 'Skickar…' : 'Bekräfta bokning'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Mina bokningar */}
          <div style={{ display: activeTab === 'mine' ? 'block' : 'none' }}>
            <h3 className="login-card-title">Mina bokningar</h3>
            {listLoading && <p>Laddar…</p>}
            {listError && <p className="status-error">{listError}</p>}
            {!listLoading && !listError && (
              <>
                {reservations && reservations.length === 0 && (
                  <p>Inga bokningar hittades.</p>
                )}
                <div style={{ display: 'grid', gap: 12 }}>
                  {(reservations || []).map((r: any) => {
                    const date = r.Date || r.date || '';
                    const time = r.Time || r.time || '';
                    const guests =
                      r.NumberOfGuests ??
                      r.numberOfGuests ??
                      r.Guests ??
                      r.guests ??
                      '?';
                    const name =
                      r.CustomerName ||
                      r.customerName ||
                      r.Name ||
                      r.name ||
                      '';
                    const phone =
                      r.PhoneNumber ||
                      r.phoneNumber ||
                      r.Phone ||
                      r.phone ||
                      '';
                    const notes =
                      r.Notes ||
                      r.notes ||
                      '';

                    return (
                      <div
                        key={r.id || r.contentItemId || Math.random()}
                        className="login-card"
                        style={{ padding: 16, boxShadow: 'none', border: '1px solid #eee' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {date + ' ' + time} • {guests} gäster
                            </div>
                            <div style={{ color: '#666', marginTop: 4 }}>
                              {name + (phone ? ', ' + phone : '')}
                            </div>
                            {notes && (
                              <div style={{ color: '#666', marginTop: 4 }}>{notes}</div>
                            )}
                          </div>
                          <div style={{ color: '#999', fontSize: 12 }}>
                            {r.createdUtc || r.CreatedUtc || ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 16 }}>
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
