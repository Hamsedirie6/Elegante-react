import { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      onLoginSuccess();
    } catch (err) {
      setError('Fel e‑post eller lösenord');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-logo" aria-hidden="true">
            {/* Enkel bestick‑ikon som SVG */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3C6.44772 3 6 3.44772 6 4V10C6 10.5523 5.55228 11 5 11V21C5 21.5523 5.44772 22 6 22C6.55228 22 7 21.5523 7 21V12H8V21C8 21.5523 8.44772 22 9 22C9.55228 22 10 21.5523 10 21V11C9.44772 11 9 10.5523 9 10V4C9 3.44772 8.55228 3 8 3H7Z" fill="white"/>
              <path d="M17 3C15.3431 3 14 4.34315 14 6V21C14 21.5523 14.4477 22 15 22C15.5523 22 16 21.5523 16 21V14H18V21C18 21.5523 18.4477 22 19 22C19.5523 22 20 21.5523 20 21V6C20 4.34315 18.6569 3 17 3Z" fill="white"/>
            </svg>
          </div>
          <h2 className="login-brand">Restaurang Elegante</h2>
          <p className="login-subtitle">Välkommen till vårt restaurangsystem</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h3 className="login-card-title">Logga in</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E‑post</label>
              <input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Lösenord</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="form-input"
                required
              />
            </div>

            {error && <div className="status-error" role="alert">{error}</div>}

            <button type="submit" disabled={isLoading} className="form-button-full">
              {isLoading ? 'Loggar in…' : 'Logga in'}
            </button>
          </form>

          <p className="login-register">
            Har du inget konto? <a href="/registrera" className="link">Registrera dig</a>
          </p>
        </div>
      </div>
    </div>
  );
}
