import { useState } from 'react';
import { api } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
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
      const username = (form.email.split('@')[0] || form.email).replace(/[^a-zA-Z0-9_.-]/g, '');
      await api.register({
        username,
        email: form.email,
        password: form.password,
      });
      setOk('Kontot är skapat. Du kan nu logga in.');
      setForm({ email: '', password: '', confirm: '', accept: false });
    } catch (err: any) {
      setError('Registreringen misslyckades. Kontrollera uppgifterna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-head">
          <div className="auth-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z" fill="white"/>
              <path d="M4 22c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 10v-2m-1 1h2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="login-card-title" style={{marginTop:8}}>Skapa konto</h2>
        </div>

        <div className="auth-body">
        <form onSubmit={submit}>
          <div className="form-group">
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Lösenord"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="form-input"
              type="password"
              name="confirm"
              placeholder="Bekräfta lösenord"
              value={form.confirm}
              onChange={onChange}
              required
            />
          </div>

          <label className="checkbox-row">
            <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} />
            <span>Jag godkänner användarvillkoren och integritetspolicyn.</span>
          </label>

          {error && <div className="status-error" role="alert">{error}</div>}
          {ok && <div className="status-ok">{ok}</div>}

          <button className="form-button-full" type="submit" disabled={loading}>
            {loading ? 'Skapar konto…' : 'Skapa konto'}
          </button>
        </form>

        <p className="auth-footer-note">
          Har du redan ett konto? <a href="/login" className="link">Logga in</a>
        </p>
        </div>
      </div>
    </div>
  );
}
