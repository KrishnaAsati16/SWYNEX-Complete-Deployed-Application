import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { watchlistApi, errorText } from '../api';
import { Spinner, ErrorBox, StatusBadge, formatDate } from '../components/Status.jsx';

function WatchlistRow({ item, onRemoved }) {
  const [note, setNote] = useState(item.note);
  const [savedNote, setSavedNote] = useState(item.note);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  const saveNote = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await watchlistApi.updateNote(item.id, note);
      setNote(updated.note);
      setSavedNote(updated.note);
      setMessage({ type: 'ok', text: 'Note saved' });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove "${item.launch.name}" from your watchlist?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await watchlistApi.remove(item.id);
      onRemoved(item.id);
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="row">
        <h3>
          <Link to={`/launches/${item.launch.id}`}>{item.launch.name}</Link>
        </h3>
        <StatusBadge status={item.launch.status} />
      </div>
      <p className="muted">
        {item.launch.rocket} · {item.launch.agency} · {formatDate(item.launch.launchDate)}
      </p>
      <textarea
        placeholder="Write a note about this launch"
        value={note}
        maxLength={1000}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn btn-small" onClick={saveNote} disabled={busy || note.trim() === savedNote}>
          {busy ? 'Saving...' : 'Save note'}
        </button>
        <button className="btn btn-small btn-danger" onClick={remove} disabled={busy}>
          Remove
        </button>
        {message && (
          <span className={message.type === 'ok' ? 'success-text' : 'error-text'}>{message.text}</span>
        )}
      </div>
    </div>
  );
}

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    watchlistApi
      .list()
      .then((data) => !cancelled && setItems(data))
      .catch((err) => !cancelled && setError(errorText(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <>
      <h1>My Watchlist</h1>
      {loading ? (
        <Spinner label="Loading your watchlist..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : items.length === 0 ? (
        <p className="muted">
          Your watchlist is empty. <Link to="/">Browse launches</Link> and add some.
        </p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <WatchlistRow
              key={item.id}
              item={item}
              onRemoved={(id) => setItems((list) => list.filter((i) => i.id !== id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
