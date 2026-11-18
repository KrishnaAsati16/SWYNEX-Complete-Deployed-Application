# Rocket Launch Tracker: Frontend

React frontend for the Rocket Launch Tracker. It talks to the backend API in `../backend` (Task 3, Frontend Integration).

## What is implemented

| Screen | Route | What it does |
|--------|-------|--------------|
| Launch List | `/` | Lists launches with search (debounced) and status filter |
| Launch Detail | `/launches/:id` | Full details, add or remove from my watchlist |
| My Watchlist | `/watchlist` | Saved launches with editable notes and remove (login required) |
| Login | `/login` | Sign in |
| Register | `/register` | Create an account |

Loading and error states:
- Every screen that fetches data shows a **spinner** while loading and an **error box with a Try again button** when the request fails (for example, when the backend is not running).
- Empty results show a friendly message (no launches found, empty watchlist).
- Buttons are disabled while a request is running, so nothing is sent twice.
- Login and register show the backend's validation messages (wrong password, email already used, weak password).
- If the token expires, the user is logged out automatically and sent to the login page when they open a protected screen.

## Setup

The backend must be running first (`npm run dev` in `backend/`, on port 5000).

1. Go to the frontend folder and install packages:
   ```
   cd frontend
   npm install
   ```
2. Create the environment file (it already points to the local backend):
   ```
   copy .env.example .env
   ```
   (on Mac or Linux: `cp .env.example .env`)
3. Start the app:
   ```
   npm run dev
   ```
4. Open http://localhost:5173

The frontend must run on port 5173, because the backend only allows that address (CORS). If you change it, update `CLIENT_ORIGIN` in `backend/.env`.

Test accounts from the backend seed: `user@example.com` / `User@12345` (admin: `admin@example.com` / `Admin@12345`).

## Project structure

```
frontend/
├── index.html
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx            # entry point
    ├── App.jsx             # navbar and routes
    ├── AuthContext.jsx     # login state shared across the app
    ├── index.css
    ├── api/index.js        # all calls to the backend
    ├── components/Status.jsx   # spinner, error box, status badge
    └── pages/              # LaunchList, LaunchDetail, Watchlist, AuthPage
```
