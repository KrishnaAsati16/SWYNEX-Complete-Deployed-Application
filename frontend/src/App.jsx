import { Routes, Route, NavLink, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from './components/Status.jsx';
import LaunchList from './pages/LaunchList.jsx';
import LaunchDetail from './pages/LaunchDetail.jsx';
import Watchlist from './pages/Watchlist.jsx';
import AuthPage from './pages/AuthPage.jsx';

function Header() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="site-header">
        <Link to="/" className="site-title">
          Rocket Launch Tracker
        </Link>
        <nav>
          <NavLink to="/" end>
            Launch Schedule
          </NavLink>
          {user && <NavLink to="/watchlist">My Watchlist</NavLink>}
        </nav>
      </header>
      <div className="subbar">
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button className="link-btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </>
  );
}

// Pages that need a logged-in user send everyone else to the login page
function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Checking your session..." />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<LaunchList />} />
          <Route path="/launches/:id" element={<LaunchDetail />} />
          <Route
            path="/watchlist"
            element={
              <Protected>
                <Watchlist />
              </Protected>
            }
          />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="*"
            element={
              <p>
                Page not found. <Link to="/">Go to launches</Link>
              </p>
            }
          />
        </Routes>
      </main>
      <footer className="footnote">
        Launch dates are subject to change. Dates and times are shown in your own time zone.
      </footer>
    </>
  );
}
