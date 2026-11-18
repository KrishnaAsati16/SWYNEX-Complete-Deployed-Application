// Small shared pieces: loading spinner, error box, status badge and date formatting

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="center" role="status">
    <div className="spinner" />
    <p className="muted">{label}</p>
  </div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="error-box" role="alert">
    <p>{message}</p>
    {onRetry && (
      <button className="btn btn-small" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const StatusBadge = ({ status }) => <span className={`badge badge-${status}`}>{status}</span>;

export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// Splits a date into big "NOV 19" text, a small time and the year (shown in the user's own time zone)
export const dateParts = (iso) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase(),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    year: d.getFullYear(),
  };
};
