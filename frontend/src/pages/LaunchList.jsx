import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { launchApi, watchlistApi, errorText } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Spinner, ErrorBox, StatusBadge, dateParts } from '../components/Status.jsx';

const STATUSES = ['upcoming', 'success', 'failed', 'delayed'];

function LaunchRow({ launch, isSaved, onStar }) {
  const { day, time, year } = dateParts(launch.launchDate);
  return (
    <div className="sched-row">
      <div>
        <div className="big">{day}</div>
        <div className="small">
          {time} · {year}
        </div>
        <button
          className={isSaved ? 'star on' : 'star'}
          onClick={() => onStar(launch.id)}
          aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>
      <div>
        <Link className="big-link" to={`/launches/${launch.id}`}>
          {launch.rocket}
        </Link>
        <div className="agency">{launch.agency}</div>
        <div>{launch.launchSite}</div>
      </div>
      <div>
        <Link className="big-link" to={`/launches/${launch.id}`}>
          {launch.name}
        </Link>
        <p className="desc">{launch.description}</p>
        <div className="tags">
          <StatusBadge status={launch.status} />
        </div>
      </div>
    </div>
  );
}

export default function LaunchList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0); // bump to retry after an error
  const [saved, setSaved] = useState({}); // launch id -> watchlist item id
  const [starError, setStarError] = useState('');

  // Wait until the user stops typing before calling the API
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false; // ignore answers from older requests
    setLoading(true);
    setError('');
    launchApi
      .list({ search: debouncedSearch, status })
      .then((data) => !cancelled && setLaunches(data))
      .catch((err) => !cancelled && setError(errorText(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, attempt]);

  // For logged-in users, remember which launches are already starred
  useEffect(() => {
    if (!user) {
      setSaved({});
      return undefined;
    }
    let cancelled = false;
    watchlistApi
      .list()
      .then((items) => !cancelled && setSaved(Object.fromEntries(items.map((i) => [i.launch.id, i.id]))))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleStar = async (launchId) => {
    if (!user) return navigate('/login');
    setStarError('');
    try {
      if (saved[launchId]) {
        await watchlistApi.remove(saved[launchId]);
        setSaved(({ [launchId]: removed, ...rest }) => rest);
      } else {
        const item = await watchlistApi.add(launchId);
        setSaved((s) => ({ ...s, [launchId]: item.id }));
      }
    } catch (err) {
      setStarError(errorText(err));
    }
    return undefined;
  };

  // Next launch and recent launches come from the same list (sorted by date, oldest first)
  const filtered = Boolean(debouncedSearch || status);
  const now = Date.now();
  const next = launches.find(
    (l) => ['upcoming', 'delayed'].includes(l.status) && new Date(l.launchDate) >= now
  );
  const recent = launches.filter((l) => new Date(l.launchDate) < now).slice(-5).reverse();

  return (
    <>
      <h1>Launch Schedule</h1>

      {!loading && !error && !filtered && (
        <div className="panels">
          <section className="panel">
            <h2 className="panel-title">Next Launch</h2>
            <div className="panel-body">
              {next ? (
                <div className="next-grid">
                  <div>
                    <div className="big">{dateParts(next.launchDate).day}</div>
                    <div className="small">{dateParts(next.launchDate).time}</div>
                  </div>
                  <div>
                    <Link className="big-link" to={`/launches/${next.id}`}>
                      {next.rocket}
                    </Link>
                    <div className="agency">{next.agency}</div>
                    <div>{next.launchSite}</div>
                  </div>
                  <div>
                    <Link className="big-link" to={`/launches/${next.id}`}>
                      {next.name}
                    </Link>
                    <div className="tags">
                      <StatusBadge status={next.status} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="muted">No upcoming launches.</p>
              )}
            </div>
          </section>
          <section className="panel">
            <h2 className="panel-title">Recent Launches</h2>
            <div className="panel-body">
              {recent.length === 0 && <p className="muted">No recent launches.</p>}
              {recent.map((l) => (
                <div key={l.id} className="recent-item">
                  <span className="recent-date">{dateParts(l.launchDate).day}</span>
                  <Link to={`/launches/${l.id}`}>{l.name}</Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="filters">
        <input
          type="search"
          placeholder="Search by mission name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {!loading && !error && <span className="muted">{launches.length} launches</span>}
      </div>

      {starError && <ErrorBox message={starError} />}

      {loading ? (
        <Spinner label="Loading launches..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => setAttempt((n) => n + 1)} />
      ) : launches.length === 0 ? (
        <p className="muted center">No launches found. Try a different search or status.</p>
      ) : (
        <div className="schedule">
          {launches.map((l) => (
            <LaunchRow key={l.id} launch={l} isSaved={Boolean(saved[l.id])} onStar={toggleStar} />
          ))}
        </div>
      )}
    </>
  );
}
