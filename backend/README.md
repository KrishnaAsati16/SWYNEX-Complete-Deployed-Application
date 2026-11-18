# Rocket Launch Tracker: Backend

REST API for the Rocket Launch Tracker, built with Node.js, Express and PostgreSQL. This is the Task 2 (Backend API and Database) part of the project. The design is described in [../docs/architecture.md](../docs/architecture.md).

## What is implemented

- **Auth:** register, login and current user, using JWT and hashed passwords
- **Launches (complete resource):** list with search and status filter, get one, create, update and delete, with input validation. Create, update and delete are admin only.
- **Watchlist:** list, add, update note and remove, always scoped to the logged-in user
- **Validation:** every request body, query and id parameter is checked with Zod, and errors come back in one clear format
- **Database:** PostgreSQL with three tables (`users`, `launches`, `watchlist_items`), foreign keys and constraints

## Setup

You need Node.js 18 or newer and PostgreSQL.

1. Create a database:
   ```
   createdb rocket_launch_tracker
   ```
   (or create it from pgAdmin)
2. Install packages:
   ```
   cd backend
   npm install
   ```
3. Create your environment file and fill in your database password and a long random `JWT_SECRET`:
   ```
   cp .env.example .env
   ```
4. Create the tables and add sample data:
   ```
   npm run db:init
   npm run db:seed
   ```
5. Start the server:
   ```
   npm run dev
   ```
   The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

Sample accounts created by the seed:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@12345 |
| User | user@example.com | User@12345 |

These are for local testing only. Do not use them in a real deployment.

## API endpoints

Protected routes need the header `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| POST | /api/auth/register | Public | Create an account |
| POST | /api/auth/login | Public | Log in and get a token |
| GET | /api/auth/me | Logged in | Current user |

### Launches
| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| GET | /api/launches | Public | List launches (`?search=` and `?status=`) |
| GET | /api/launches/:id | Public | One launch |
| POST | /api/launches | Admin | Create a launch |
| PATCH | /api/launches/:id | Admin | Update a launch |
| DELETE | /api/launches/:id | Admin | Delete a launch |

### Watchlist
| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| GET | /api/watchlist | Logged in | My watchlist with launch details |
| POST | /api/watchlist | Logged in | Add a launch (`{ "launchId": 1 }`) |
| PATCH | /api/watchlist/:id | Logged in | Update the note |
| DELETE | /api/watchlist/:id | Logged in | Remove an item |

## Validation rules (Launch)

| Field | Rule |
|-------|------|
| name | Required, 2 to 150 characters |
| rocket | Required, 2 to 100 characters |
| agency | Required, 2 to 100 characters |
| launchSite | Required, 2 to 150 characters |
| launchDate | Required, a valid date (ISO format, for example `2027-03-01T04:30:00Z`) |
| status | One of `upcoming`, `success`, `failed`, `delayed` (default `upcoming`) |
| description | Optional, up to 2000 characters |

For updates, every field is optional but at least one must be sent.

Example of a validation error:
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "name", "message": "Name must be at least 2 characters" },
    { "field": "launchDate", "message": "launchDate must be a valid date" }
  ]
}
```

Other errors use the shape `{ "error": "message" }` with these status codes: 400 invalid input, 401 not logged in or bad token, 403 not an admin, 404 not found, 409 duplicate (same email, or launch already in the watchlist).

## Try it with curl

Log in as admin and save the token:
```
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'
```

Create a launch (replace `<token>`):
```
curl -X POST http://localhost:5000/api/launches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Mission","rocket":"Test-1","agency":"Test Agency","launchSite":"Test Site","launchDate":"2027-05-10T08:00:00Z"}'
```

Search launches:
```
curl "http://localhost:5000/api/launches?search=chandra&status=success"
```

You can run the same requests in Postman or Thunder Client.

## Project structure

```
backend/
├── sql/schema.sql            # table definitions
├── src/
│   ├── server.js             # starts the server
│   ├── app.js                # express setup and routes
│   ├── config/db.js          # PostgreSQL connection
│   ├── db/                   # init.js (create tables) and seed.js (sample data)
│   ├── routes/               # URL to controller mapping
│   ├── controllers/          # request handling and SQL queries
│   ├── middleware/           # auth, validation, error handler
│   ├── validators/schemas.js # Zod validation rules
│   └── utils/asyncHandler.js
├── .env.example
└── package.json
```
