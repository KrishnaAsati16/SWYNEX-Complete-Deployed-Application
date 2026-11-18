# SWYNEX Rocket Launch Tracker (Full Stack, Deploy Repo)

A full-stack web app to browse rocket launches, search and filter them, and keep a personal watchlist with notes. This repository holds the complete, deployable version: the REST API in `backend/` and the React app in `frontend/`.

Built as part of the SWYNEX Technologies Full Stack Developer Internship (Task 1: architecture, Task 2: backend API and database, Task 3: frontend integration).


## Live Demo

- **Frontend:** https://swynex-frontend-integration-eta.vercel.app/
- **Backend API:** https://swynex-backendapianddatabase.onrender.com
- **GitHub Repository:** https://github.com/KrishnaAsati16/SWYNEX-Complete-Deployed-Application
 

**Live demo:** `<add your frontend URL here>`
**API health check:** `<add your backend URL here>/api/health`

## Features

- **Authentication:** register, login and current user with JWT and bcrypt-hashed passwords
- **Launches:** list with debounced search and status filter, detail page, and admin-only create, update and delete
- **Watchlist:** save launches, edit a personal note, remove items (always scoped to the logged-in user)
- **Roles:** `user` and `admin`
- **Validation:** every request body, query and id parameter is checked with Zod, with one consistent error format
- **UX states:** spinner while loading, error box with a Try again button, friendly empty states, disabled buttons during requests, automatic logout when the token expires

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, React Router 6 |
| Backend | Node.js 18+, Express 4, Zod, jsonwebtoken, bcryptjs, cors |
| Database | PostgreSQL (`pg`) with three tables: `users`, `launches`, `watchlist_items` |

## Repository structure

```
.
├── backend/     # Express REST API + PostgreSQL schema and seed script
│   ├── sql/schema.sql
│   ├── src/     # server, app, routes, controllers, middleware, validators, db
│   └── .env.example
└── frontend/    # React + Vite single-page app
    ├── src/     # pages, components, api client, auth context
    └── .env.example
```

More detail: [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## Run locally

Requirements: Node.js 18 or newer and PostgreSQL.

### 1. Backend

```bash
createdb rocket_launch_tracker
cd backend
npm install
cp .env.example .env        # then fill in DATABASE_URL and a long random JWT_SECRET
npm run db:init             # create tables
npm run db:seed             # optional: sample launches and test accounts
npm run dev                 # http://localhost:5000
```

Check `http://localhost:5000/api/health`, it should return `{ "status": "ok" }`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # on Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

The frontend must run on port 5173 locally, because the backend allows only that origin (CORS). If you change it, update `CLIENT_ORIGIN` in `backend/.env`.

### Sample accounts (created by `npm run db:seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@12345 |
| User | user@example.com | User@12345 |

For local testing only. Do not seed these accounts in a public deployment, or change their passwords straight away.

## Environment variables

### Backend (`backend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | Port the API listens on (most hosts set this for you) |
| `DATABASE_URL` | `postgres://user:password@host:5432/dbname` | PostgreSQL connection string |
| `JWT_SECRET` | long random string | Signs login tokens. The server refuses to start without it |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_ORIGIN` | `https://your-frontend.example.com` | The one frontend origin allowed by CORS |

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`frontend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `https://your-backend.example.com/api` | Base URL of the backend API |

`VITE_API_URL` is read at **build time**, so after changing it you must rebuild and redeploy the frontend.

## Deployment

The app deploys as three pieces: a PostgreSQL database, the backend web service, and the static frontend. Any host with Node and Postgres support works (for example Render, Railway, Neon, Vercel or Netlify). Deploy in this order, because each step needs a value from the previous one.

### 1. Database

1. Create a PostgreSQL database on your host and copy its connection string.
2. Most hosted databases require SSL. If you get an SSL error, add `?sslmode=require` to the end of `DATABASE_URL`.

### 2. Backend

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Environment variables | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN` (set after the frontend is live) |

After the first deploy, create the tables once. Run this from the host's shell, or locally with `DATABASE_URL` pointing at the hosted database:

```bash
npm run db:init
```

Optionally run `npm run db:seed` to load the sample launches. Then open `<backend-url>/api/health` to confirm the API is up.

### 3. Frontend

| Setting | Value |
|---------|-------|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_API_URL` = `<backend-url>/api` |

Because this is a single-page app using React Router, add a rewrite rule so every path serves `index.html`. Otherwise refreshing on `/watchlist` or `/launches/3` shows a 404.

- **Vercel:** add `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- **Netlify:** add `public/_redirects` containing `/*  /index.html  200`
- **Render static site:** add a rewrite rule `/*` to `/index.html`

### 4. Connect them

Set `CLIENT_ORIGIN` on the backend to the exact frontend URL, with `https://` and **no trailing slash**, then redeploy the backend. A mismatch here shows up in the browser as a CORS error.

## API overview

Protected routes need the header `Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in and get a token |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/launches` | Public | List launches (`?search=` and `?status=`) |
| GET | `/api/launches/:id` | Public | One launch |
| POST | `/api/launches` | Admin | Create a launch |
| PATCH | `/api/launches/:id` | Admin | Update a launch |
| DELETE | `/api/launches/:id` | Admin | Delete a launch |
| GET | `/api/watchlist` | Logged in | My watchlist with launch details |
| POST | `/api/watchlist` | Logged in | Add a launch (`{ "launchId": 1 }`) |
| PATCH | `/api/watchlist/:id` | Logged in | Update the note |
| DELETE | `/api/watchlist/:id` | Logged in | Remove an item |

Errors use the shape `{ "error": "message" }` (validation errors add a `details` array). Status codes: 400 invalid input, 401 not logged in or bad token, 403 not an admin, 404 not found, 409 duplicate.

Full validation rules and curl examples are in [backend/README.md](backend/README.md).

## Troubleshooting

| Problem | Likely cause and fix |
|---------|---------------------|
| Browser shows a CORS error | `CLIENT_ORIGIN` does not exactly match the frontend URL (check `https`, and no trailing slash) |
| Frontend says "Cannot reach the server" | `VITE_API_URL` is wrong or missing. Fix it and **rebuild** the frontend |
| Backend exits with "Missing DATABASE_URL or JWT_SECRET" | Environment variables are not set on the host |
| Database SSL or connection error | Add `?sslmode=require` to `DATABASE_URL` |
| Pages 404 after refresh | Missing single-page-app rewrite rule (see Frontend deployment) |
| API returns "relation does not exist" | Tables were not created. Run `npm run db:init` |

## Security notes

- Never commit `.env` files. Both `.gitignore` files exclude them, and only `.env.example` belongs in the repo.
- Use a long random `JWT_SECRET` in production.
- Do not leave the seeded demo accounts active on a public deployment.

## Author

Krishna Asati, SWYNEX Technologies Full Stack Developer Internship, November to December 2026.

## License

MIT
