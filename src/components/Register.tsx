import { useState } from 'react';
import { api } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    accept: false,
  });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');

    if (!form.accept) {
      setError('Du måste godkänna villkoren.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Lösenorden matchar inte.');
      return;
    }

    setLoading(true);
    try {
      await api.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setOk('Kontot är skapat. Du kan nu logga in.');
      setForm({ username: '', email: '', password: '', confirm: '', accept: false });
    } catch (err: any) {
      setError('Registreringen misslyckades. Kontrollera uppgifterna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-small">
      <h1>Skapa konto</h1>
      <form className="form" onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Användarnamn</label>
          <input className="form-input" name="username" value={form.username} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">E‑post</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Lösenord</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Bekräfta lösenord</label>
          <input className="form-input" type="password" name="confirm" value={form.confirm} onChange={onChange} required />
        </div>
        {/* Förnamn, efternamn och telefon är borttagna för enkel registrering */}
        <div className="form-group" style={{display:'flex', alignItems:'center', gap:8}}>
          <input id="accept" type="checkbox" name="accept" checked={form.accept} onChange={onChange} />
          <label htmlFor="accept" className="form-label" style={{margin:0}}>Jag godkänner villkoren och integritetspolicyn.</label>
        </div>

        {error && <div className="status-error">{error}</div>}
        {ok && <div className="status-ok">{ok}</div>}

        <button className="form-button-full" type="submit" disabled={loading}>
          {loading ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
    </div>
  );
}
