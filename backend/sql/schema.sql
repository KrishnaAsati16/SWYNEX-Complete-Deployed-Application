CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS launches (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  rocket      VARCHAR(100) NOT NULL,
  agency      VARCHAR(100) NOT NULL,
  launch_site VARCHAR(150) NOT NULL,
  launch_date TIMESTAMPTZ  NOT NULL,
  status      VARCHAR(10)  NOT NULL DEFAULT 'upcoming'
              CHECK (status IN ('upcoming', 'success', 'failed', 'delayed')),
  description TEXT         NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  launch_id  INTEGER     NOT NULL REFERENCES launches(id) ON DELETE CASCADE,
  note       TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, launch_id)
);
