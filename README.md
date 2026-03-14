# Request Management System

## Overview

This project demonstrates a simple **request management system** for access requests to internal applications. It consists of a **backend API** (Node.js, TypeScript, Express) and a **lightweight React UI** that consumes the API.

It was implemented as part of a technical home assignment for a Full Stack / IT Application Developer position.

## Architecture Diagram

```
    React UI (Vite)
         |
         | JWT Bearer token
         v
    Express API
         |
    Auth middleware (authenticate -> authorize)
         |
         v
    Services Layer
         |
         v
    In-memory Storage (requests + users)
```

## Tech Stack

**Backend**

- Node.js
- TypeScript
- Express
- jsonwebtoken (JWT authentication)

**Frontend**

- React
- Vite

## Authentication

The API uses **JWT-based authentication** with two user roles:

| Role | Capabilities |
|------|-------------|
| **requester** | Create access requests, view own requests |
| **approver** | View all requests (with filters), approve/deny requests, AI summary and analysis |

### Pre-seeded Users

| Username | Password | Role |
|----------|----------|------|
| `requester1` | `pass123` | requester |
| `requester2` | `pass123` | requester |
| `approver1` | `pass123` | approver |

### Auth Flow

1. Call `POST /auth/login` with `username` and `password` to receive a JWT token.
2. Include the token in subsequent requests via the `Authorization: Bearer <token>` header.
3. The token expires after 1 hour.

## Features

- **JWT authentication** - Login with username/password, role-based access control (requester vs approver)
- **Create requests** - Requesters submit new access requests; `createdBy` and `requesterId` are derived from the JWT token
- **List requests** - Approvers retrieve all requests with optional filters (`?createdBy=...&status=...`); requesters see only their own
- **Approve or deny requests** - Approvers update request status; `decisionBy` is derived from the token
- **AI summary** - Approvers get a summary of pending requests (count, applications, requesters)
- **AI request analysis** - Approvers get a rule-based risk level for a request
- **Validation middleware** - Request body validation for login, create, and analyze
- **Logging middleware** - Request logging (method, URL, status, duration)
- **Centralized error handling** - Consistent JSON error responses (`401`, `403`, `404`, `400`, `500`)
- **Role-based React UI** - Login page, requester view (create + own requests), approver view (table with filters, approve/deny, AI summary)

## Project Structure

**Backend (repository root)**

```
src/
  routes/           # Auth, request, and AI route handlers
  services/         # Auth, request, and AI business logic
  models/           # Types for request and user entities
  storage/          # In-memory request and user stores
  middleware/       # Authenticate, authorize, logger, validation, error handler
  ai/               # AI risk rules (used by aiService)
  __tests__/        # Integration tests (requests + AI)
  index.ts          # App entry, server start
```

**Frontend**

```
frontend/
  src/
    App.tsx           # Root component with role-based views
    api.ts            # Fetch wrapper with JWT token attachment
    types.ts          # Shared types
    styles.css        # Global styles
    context/
      AuthContext.tsx  # Auth state management (token + user in localStorage)
    components/
      LoginPage.tsx
      CreateRequestForm.tsx
      RequestsTable.tsx
      AiSummary.tsx
```

## API Endpoints

Base URL: `http://localhost:3000` (when backend is running).

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate and receive a JWT token |
| GET | `/health` | Health check - returns `{ "status": "ok" }` |

### Protected - Requester

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/requests` | Create a new access request |
| GET | `/requests` | List own requests (auto-filtered by token username) |

### Protected - Approver

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requests` | List all requests, optional `?createdBy=...&status=...` filters |
| POST | `/requests/:id/approve` | Approve a pending request |
| POST | `/requests/:id/deny` | Deny a pending request |
| GET | `/ai/summary` | AI summary of pending requests |
| POST | `/ai/analyze` | AI risk analysis for a request |

### Example Request Bodies

- **POST /auth/login**

  ```json
  { "username": "requester1", "password": "pass123" }
  ```

  Response:

  ```json
  { "token": "<jwt>", "user": { "id": "1", "username": "requester1", "role": "requester" } }
  ```

- **POST /requests** (requires requester token)

  ```json
  { "application": "Internal Portal" }
  ```

- **POST /ai/analyze** (requires approver token)

  By request ID:

  ```json
  { "requestId": "<uuid>" }
  ```

  By request object:

  ```json
  { "request": { "application": "HR System", "createdBy": "jane" } }
  ```

### Error Responses

All errors return consistent JSON: `{ "error": "<message>" }`.

| Status | Meaning |
|--------|---------|
| 400 | Validation error (missing/invalid fields) |
| 401 | Authentication required, invalid/expired token, or invalid credentials |
| 403 | Forbidden - insufficient permissions for the user's role |
| 404 | Resource or route not found |

## Running the Project

**Backend**

From the repository root:

```bash
npm install
npm run dev
```

The API runs at **http://localhost:3000** (or the port set in `PORT`).

Optionally set `JWT_SECRET` environment variable (defaults to `dev-secret`).

**Frontend**

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The UI is served by Vite (typically **http://localhost:5173**). It calls the backend at `http://localhost:3000`; ensure the backend is running first.

**Tests**

```bash
npm test
```

Runs integration tests covering authentication, authorization, request CRUD, filtering, and AI endpoints.

## Design Decisions

- **Routes vs services** - Routes stay thin and only delegate to services; all business logic and validation rules live in the service layer.
- **Middleware** - Authentication, authorization, validation, logging, and error handling are implemented as Express middleware for a clear pipeline and consistent behavior.
- **JWT authentication** - Stateless token-based auth with role claims (`requester` / `approver`). The token carries `userId`, `username`, and `role`; `createdBy` and `decisionBy` are derived server-side from the token rather than accepted from the client.
- **Request-user link** - Each `AccessRequest` stores both `requesterId` (user ID foreign key) and `createdBy` (username for display/filtering).
- **In-memory storage** - Storage is in-memory by design for simplicity and to avoid database setup; the structure allows swapping in a real store later.
- **React UI** - A small React + Vite app with context-based auth state, role-based views, and automatic token management (auto-logout on 401).

## Future Improvements

- **Database persistence** - Replace in-memory store with a database (e.g. PostgreSQL, SQLite).
- **Password hashing** - Replace plain-text passwords with bcrypt or similar.
- **Refresh tokens** - Add refresh token flow for longer sessions without re-login.
- **API documentation** - OpenAPI/Swagger or similar for the REST API.
- **Docker setup** - Dockerfile and optional docker-compose for backend and frontend.
