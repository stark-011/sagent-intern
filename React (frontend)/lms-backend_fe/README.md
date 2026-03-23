# Library Management System Frontend

React 18+ single-page frontend for a Library Management System backed by Spring Boot REST APIs.

## Tech Stack

- React 18+
- React Router v6
- Axios with interceptor
- Context API authentication
- Tailwind CSS
- Toast notifications (`react-hot-toast`)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

If omitted, frontend uses relative `/api` routes and CRA dev proxy (`package.json -> proxy`) forwards to `http://localhost:8080`.

## Tailwind Setup

Tailwind is already configured in:

- `tailwind.config.js`
- `postcss.config.js`
- `src/index.css`

No additional setup is required after `npm install`.

## Running the App

```bash
npm start
```

Runs at `http://localhost:3000`.

## Production Build

```bash
npm run build
```

## API Base URL

Frontend calls only these controller routes:

- `/api/users`
- `/api/stock`
- `/api/issues`
- `/api/notifications`
