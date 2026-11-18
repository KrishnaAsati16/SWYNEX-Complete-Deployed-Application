const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'rlt_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Turns an error into text for the screen, including field-level validation messages
export const errorText = (err) =>
  err.details && err.details.length ? err.details.map((d) => d.message).join('. ') : err.message;

// One place that talks to the backend: adds the token, parses JSON and turns failures into ApiError
async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // An expired or invalid token: clear it and tell the app to log the user out
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      setToken(null);
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError((data && data.error) || 'Something went wrong', res.status, data && data.details);
  }
  return data;
}

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
};

export const launchApi = {
  list: ({ search, status } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const qs = params.toString();
    return request(`/launches${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/launches/${id}`),
};

export const watchlistApi = {
  list: () => request('/watchlist'),
  add: (launchId) => request('/watchlist', { method: 'POST', body: { launchId } }),
  updateNote: (id, note) => request(`/watchlist/${id}`, { method: 'PATCH', body: { note } }),
  remove: (id) => request(`/watchlist/${id}`, { method: 'DELETE' }),
};
