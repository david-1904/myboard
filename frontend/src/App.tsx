import { useState, useEffect, FormEvent } from 'react';
import Board from './components/Board';
import * as api from './api/dashboardApi';
import './styles/board.css';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(data => setUser(data.username))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (checking) {
    return <div className="board-loading">Laden...</div>;
  }

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return <Board username={user} onLogout={handleLogout} />;
}

function AuthPage({ onLogin }: { onLogin: (username: string) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await api.register(username, password);
      }
      const data = await api.login(username, password);
      onLogin(data.username);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = err as { response?: { data?: { error?: string } } };
        setError(resp.response?.data?.error || 'Fehler bei der Anmeldung');
      } else {
        setError('Verbindungsfehler');
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Registrieren' : 'Anmelden'}</h2>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">{isRegister ? 'Registrieren' : 'Anmelden'}</button>
        <div className="auth-toggle">
          {isRegister ? 'Bereits registriert? ' : 'Noch kein Konto? '}
          <span onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Anmelden' : 'Registrieren'}
          </span>
        </div>
      </form>
    </div>
  );
}
