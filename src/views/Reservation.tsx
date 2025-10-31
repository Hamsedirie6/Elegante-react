import { useState } from 'react';

export default function Reservation() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', guests: 2, name: '', phone: '', notes: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Anropa backend, t.ex.:
      // await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await new Promise(r => setTimeout(r, 500));
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Boka ditt bord</h1>
      {saved ? (
        <p>Tack! Din bokning är mottagen.</p>
      ) : (
        <form onSubmit={submit} className="form" style={{ maxWidth: 720 }}>
          <div className="form-group">
            <label className="form-label">Datum</label>
            <input className="form-input" type="date" value={form.date} onChange={e =>
setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Tid</label>
            <input className="form-input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Antal gäster</label>
            <input className="form-input" type="number" min={1} value={form.guests} onChange={e => setForm({ ...form, guests: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Namn</label>
            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Telefon</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Anteckningar</label>
            <textarea className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button className="form-button-full" disabled={loading}>
            {loading ? 'Skickar…' : 'Bekräfta bokning'}
          </button>
        </form>
      )}
    </div>
  );
}

 