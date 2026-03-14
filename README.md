# Request Management System

## Overview

This project demonstrates a simple **request management system** for access requests to internal applications. It consists of a **backend API** (Node.js, TypeScript, Express) and a **lightweight React UI** that consumes the API.

It was implemented as part of a technical home assignment for a Full Stack / IT Application Developer position.

## Architecture Diagram

```
    React UI
         |
         v
    Express API
         |
         v
    Services Layer
         |
         v
    In-memory Storage
```

## Tech Stack

**Backend**

- Node.js
- TypeScript
- Express

**Frontend**

- React
- Vite

## Features

- **Create requests** - Submit new access requests with application name and requester
- **List requests** - Retrieve all requests with status and metadata
- **Approve or deny requests** - Update request status with an optional decision-by value
- **AI summary** - Get a summary of pending requests (count, applications, requesters)
- **AI request analysis** - Get a simple risk level for a request (rule-based)
- **Validation middleware** - Request body validation for create, approve/deny, and analyze
- **Logging middleware** - Request logging (method, URL, status, duration)
- **Centralized error handling** - Consistent JSON error responses and 404 for unknown routes
- **Lightweight React UI** - Create requests, view table, approve/deny, and generate AI summary

## Project Structure

**Backend (repository root)**

```
src/
  routes/          # Request and AI route handlers
  services/        # Request and AI business logic
  models/          # Types and request entity
  storage/         # In-memory request store
  middleware/       # Logger, validation, error handler
  ai/               # AI risk rules (used by aiService)
  index.ts          # App entry, server start
```

**Frontend**

```
frontend/
  src/
    App.tsx
    api.ts          # Fetch wrapper for backend API
    types.ts        # Shared types
    styles.css      # Global styles
    components/
      CreateRequestForm.tsx
      RequestsTable.tsx
      AiSummary.tsx
```

## API Endpoints

Base URL: `http://localhost:3000` (when backend is running).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/requests` | Create a new access request |
| GET    | `/requests` | List all requests |
| POST   | `/requests/:id/approve` | Approve a request |
| POST   | `/requests/:id/deny` | Deny a request |
| GET    | `/ai/summary` | AI summary of pending requests |
| POST   | `/ai/analyze` | AI risk analysis for a request |

**Example request bodies**

- **POST /requests**

  ```json
  { "application": "Internal Portal", "createdBy": "john.doe" }
  ```

- **POST /requests/:id/approve** (optional body)

  ```json
  { "decisionBy": "manager" }
  ```

- **POST /requests/:id/deny** (optional body)

  ```json
  { "decisionBy": "manager" }
  ```

- **POST /ai/analyze** (one of the following)

  By request ID:

  ```json
  { "requestId": "<uuid>" }
  ```

  By request object:

  ```json
  { "request": { "application": "HR System", "createdBy": "jane" } }
  ```

**Health check**

- **GET /health** – Returns `{ "status": "ok" }`.

## Running the Project

**Backend**

From the repository root:

```bash
npm install
npm run dev
```

The API runs at **http://localhost:3000** (or the port set in `PORT`).

**Frontend**

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The UI is served by Vite (typically **http://localhost:5173**). It calls the backend at `http://localhost:3000`; ensure the backend is running first.

## Design Decisions

- **Routes vs services** - Routes stay thin and only delegate to services; all business logic and validation rules live in the service layer.
- **Middleware** - Validation, logging, and error handling are implemented as Express middleware for a clear pipeline and consistent behavior.
- **In-memory storage** - Storage is in-memory by design for simplicity and to avoid database setup; the structure allows swapping in a real store later.
- **React UI** - A small React + Vite app was added to demonstrate the full flow (create, list, approve/deny, AI summary) without extra frameworks or heavy state management.
