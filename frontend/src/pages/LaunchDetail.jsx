import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { launchApi, watchlistApi, errorText } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Spinner, ErrorBox, StatusBadge, formatDate } from '../components/Status.jsx';

export default function LaunchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState(null); // my watchlist item for this launch, if any
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    launchApi
      .get(id)
      .then((data) => !cancelled && setLaunch(data))
      .catch((err) => !cancelled && setError(errorText(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  // For logged-in users, check whether this launch is already in their watchlist
  useEffect(() => {
    if (!user) {
      setSaved(null);
      return undefined;
    }
    let cancelled = false;
    watchlistApi
      .list()
      .then((items) => !cancelled && setSaved(items.find((i) => i.launch.id === Number(id)) || null))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const toggleWatchlist = async () => {
    setBusy(true);
    setActionError('');
    try {
      if (saved) {
        await watchlistApi.remove(saved.id);
        setSaved(null);
      } else {
        setSaved(await watchlistApi.add(Number(id)));
      }
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading launch..." />;
  if (error) return <ErrorBox message={error} onRetry={() => setAttempt((n) => n + 1)} />;

  return (
    <>
      <p>
        <Link to="/">← Back to launches</Link>
      </p>
      <h1>{launch.name}</h1>
      <StatusBadge status={launch.status} />
      <div className="meta">
        <div>
          <span>Rocket</span>
          {launch.rocket}
        </div>
        <div>
          <span>Agency</span>
          {launch.agency}
        </div>
        <div>
          <span>Launch site</span>
          {launch.launchSite}
        </div>
        <div>
          <span>Launch date</span>
          {formatDate(launch.launchDate)}
        </div>
      </div>
      <p>{launch.description || 'No description available.'}</p>

      {user ? (
        <div className="row">
          <button
            className={saved ? 'btn btn-outline' : 'btn'}
            onClick={toggleWatchlist}
            disabled={busy}
          >
            {busy ? 'Please wait...' : saved ? 'Remove from watchlist' : 'Add to watchlist'}
          </button>
          {saved && <Link to="/watchlist">Edit note in My Watchlist</Link>}
        </div>
      ) : (
        <p className="muted">
          <Link to="/login">Log in</Link> to save this launch to your watchlist.
        </p>
      )}
      {actionError && <ErrorBox message={actionError} />}
    </>
  );
}
