# Finance Tracker Frontend (React SPA)

Production-ready single-page frontend for a Spring Boot personal budget tracker backend.

## Tech Stack

- React (CRA)
- React Router DOM
- Axios with JWT interceptor
- Context API for global auth state
- Material UI (responsive UI)
- Recharts (dashboard analytics)
- React Toastify (error/success notifications)

## Backend Base URL

Configured via:

```env
REACT_APP_API_BASE_URL=
```

Default behavior uses relative API paths plus CRA dev proxy (`package.json` -> `proxy: http://localhost:8080`) to avoid CORS in local development.
Set `REACT_APP_API_BASE_URL` only when needed for production cross-origin deployments.
An explicit proxy middleware is also configured in `src/setupProxy.js` for `/api/*` and `/auth/*`.

## Backend Endpoint Mapping

This frontend integrates with these controllers:

- `POST /api/users`, `GET /api/users`, `GET /api/users/{id}`
- `POST /api/incomes`, `GET /api/incomes`, `GET /api/incomes/{id}`, `DELETE /api/incomes/{id}`
- `POST /api/expenses`, `GET /api/expenses`, `GET /api/expenses/{id}`, `DELETE /api/expenses/{id}`
- `POST /api/categories`, `GET /api/categories`, `GET /api/categories/{id}`, `DELETE /api/categories/{id}`
- `POST /api/savings`, `GET /api/savings`, `GET /api/savings/{id}`, `DELETE /api/savings/{id}`
- `POST /api/balances`, `GET /api/balances`, `GET /api/balances/{id}`, `PUT /api/balances/{id}`, `DELETE /api/balances/{id}`

## Authentication

Expected auth endpoints for JWT:

- `POST /api/auth/register`
- `POST /api/auth/login`

If these endpoints are unavailable, the app automatically falls back to `/api/users` for dev compatibility and creates a local JWT token so protected routing still works.
By default, this project now uses `/api/users` for register/login fallback-first. To force `/api/auth/*`, set:

```env
REACT_APP_ENABLE_AUTH_ENDPOINTS=true
```

## Features Implemented

- User registration and login
- JWT persisted in `localStorage`
- Private route protection
- Dashboard cards:
  - Total Income
  - Total Expenses
  - Remaining Balance (`Income - Expenses`)
  - Savings Progress
- Dashboard charts:
  - Expenses by category (Pie)
  - Monthly spending (Bar)
- Income CRUD (create/list/delete)
- Expense CRUD (create/list/delete)
- Category creation
- Category budget setting with overspending warnings
- Savings goals with progress bars and percentage
- Responsive professional layout for desktop and mobile

## Project Structure

```text
src/
  api/
  components/
  pages/
  context/
  services/
  routes/
  utils/
```

## Setup & Run

1. Install dependencies:

```bash
npm install
```

2. (Optional) create local env file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm start
```

4. Build for production:

```bash
npm run build
```

App runs at `http://localhost:3000` by default.

## Notes

- Budget limits are stored in browser `localStorage` because no dedicated budget endpoint is present in the provided backend controllers.
- Axios interceptor automatically attaches `Authorization: Bearer <token>` when token exists.
- For real cross-origin production (different frontend and backend domains), configure CORS in Spring Boot/Spring Security.
