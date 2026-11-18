import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errorText } from '../api';

// One form component used for both /login and /register
export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const location = useLocation();
  const from = (location.state && location.state.from && location.state.from.pathname) || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Once logged in (or if already logged in), go back to where the user wanted to be
  if (user) return <Navigate to={from} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <h1>{isLogin ? 'Login' : 'Create an account'}</h1>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {!isLogin && (
        <>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required minLength={2} />
        </>
      )}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        required
      />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
      </button>
      <p className="muted">
        {isLogin ? (
          <>
            No account yet? <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            Already registered? <Link to="/login">Login</Link>
          </>
        )}
      </p>
    </form>
  );
}
