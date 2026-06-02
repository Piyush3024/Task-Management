# Task Management API

REST API for task management built with Node.js, Express.js, MongoDB, and Redis. Implements session-based authentication, Redis caching, rate limiting, login attempt tracking, and activity analytics.

---

## Project Overview

### What It Is

A RESTful task management API where users can register, log in, and manage their tasks (create, list, update, delete). The API uses Redis for five distinct purposes: session storage, rate limiting, task list caching, login attempt tracking, and activity analytics counters.

### Tech Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Runtime         | Node.js v22+                          |
| Framework       | Express.js v5                         |
| Language        | JavaScript (ESM — `"type": "module"`) |
| Database        | MongoDB via Mongoose                  |
| Cache / Session | Redis via ioredis                     |
| Validation      | Zod v4                                |
| Logging         | Winston                               |
| Auth            | express-session + custom IoRedisStore |
| Security        | helmet + cors                         |
| Rate Limiting   | Custom Redis middleware               |
| Env Validation  | envalid (fail-fast on missing vars)   |

### Dev Tooling

| Tool                    | Purpose                              |
| ----------------------- | ------------------------------------ |
| ESLint v9 (flat config) | Linting                              |
| Prettier                | Code formatting                      |
| Husky v9                | Git hooks                            |
| lint-staged             | Run linters on staged files only     |
| Commitlint              | Enforce conventional commit messages |
| nodemon                 | Hot reload in development            |
| Docker Compose          | MongoDB + Redis containers           |

---

## Prerequisites

Before running this project, ensure you have the following installed:

| Requirement    | Version                           | Check                    |
| -------------- | --------------------------------- | ------------------------ |
| Node.js        | v22 or higher                     | `node --version`         |
| npm            | v10 or higher                     | `npm --version`          |
| Docker         | Any recent version                | `docker --version`       |
| Docker Compose | v2+ (bundled with Docker Desktop) | `docker compose version` |

> **No Docker?** You can install MongoDB and Redis manually instead. See the [official MongoDB install guide](https://www.mongodb.com/docs/manual/installation/) and [Redis install guide](https://redis.io/docs/install/install-redis/). Update `MONGODB_URI` and `REDIS_URL` in `.env` accordingly.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-management-api
```

### 2. Install Dependencies

```bash
npm install
```

This also runs `husky` to set up Git hooks automatically (via the `prepare` script).

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. At minimum, generate a secure `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as your `SESSION_SECRET` value. See the [Environment Variables](#environment-variables) table for all options.

### 4. Start MongoDB and Redis

```bash
docker compose up -d
```

This starts:

- **MongoDB** on `localhost:27017` (with persistent volume)
- **Redis** on `localhost:6379` (with AOF persistence)

Verify both are running:

```bash
docker compose ps
```

### 5. Start Development Server

```bash
npm run dev
```

The server starts with hot reload via nodemon. You should see:

```
HH:mm:ss info: MongoDB connected
HH:mm:ss info: Redis ready
HH:mm:ss info: Server started { port: 3000, env: 'development' }
```

### 6. Start Production Server

```bash
NODE_ENV=production npm start
```

Ensure all environment variables are set correctly for production (secure `SESSION_SECRET`, locked-down `CORS` origin, HTTPS for session cookies).

---

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables. The app will **refuse to start** if any `Required` variable is missing (enforced by envalid).

| Variable                       | Required | Default       | Description                                                                            |
| ------------------------------ | -------- | ------------- | -------------------------------------------------------------------------------------- |
| `NODE_ENV`                     | Yes      | `development` | App environment. Accepted: `development`, `production`, `test`                         |
| `PORT`                         | No       | `3000`        | HTTP server port                                                                       |
| `MONGODB_URI`                  | Yes      | —             | MongoDB connection string. Format: `mongodb://user:pass@host:port/db?authSource=admin` |
| `REDIS_URL`                    | Yes      | —             | Redis connection URL. Format: `redis://localhost:6379`                                 |
| `SESSION_SECRET`               | Yes      | —             | Secret for signing session cookies. **Minimum 32 characters.** Rotate in production.   |
| `SESSION_EXPIRY_SECONDS`       | No       | `86400`       | Session TTL in seconds (default: 24 hours)                                             |
| `LOGIN_MAX_ATTEMPTS`           | No       | `5`           | Max consecutive failed login attempts before account is blocked                        |
| `LOGIN_BLOCK_DURATION_SECONDS` | No       | `900`         | How long a blocked account stays blocked in seconds (default: 15 minutes)              |
| `RATE_LIMIT_MAX`               | No       | `20`          | Maximum requests allowed per IP per rate limit window                                  |
| `RATE_LIMIT_WINDOW_MS`         | No       | `60000`       | Rate limit window duration in milliseconds (default: 1 minute)                         |

---

## API Documentation

All responses follow a consistent shape:

**Success:**

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

**Error:**

```json
{
  "success": false,
  "errorCode": "MACHINE_READABLE_CODE",
  "message": "Human-readable message",
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

---

### Auth Endpoints

#### `POST /register`

Register a new user account.

- **Auth required:** No

**Request Body:**

```json
{
  "name": "Piyush Bhul",
  "email": "piyush@example.com",
  "password": "securepassword123"
}
```

| Field      | Type   | Rules                              |
| ---------- | ------ | ---------------------------------- |
| `name`     | string | 2–100 characters                   |
| `email`    | string | Valid email format, must be unique |
| `password` | string | 8–128 characters                   |

**Success — `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "6660a1b2c3d4e5f6a7b8c9d0",
    "name": "Piyush Bhul",
    "email": "piyush@example.com"
  },
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

**Errors:**

| Status | errorCode          | Cause                     |
| ------ | ------------------ | ------------------------- |
| `400`  | `VALIDATION_ERROR` | Missing or invalid fields |
| `409`  | `EMAIL_TAKEN`      | Email already registered  |

---

#### `POST /login`

Authenticate with email and password. Creates a session stored in Redis.

- **Auth required:** No

**Request Body:**

```json
{
  "email": "piyush@example.com",
  "password": "securepassword123"
}
```

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "6660a1b2c3d4e5f6a7b8c9d0",
    "name": "Piyush Bhul",
    "email": "piyush@example.com"
  },
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

A `Set-Cookie` header is returned with the session cookie (`connect.sid`). Include this cookie in all subsequent authenticated requests.

**Errors:**

| Status | errorCode             | Cause                                             |
| ------ | --------------------- | ------------------------------------------------- |
| `400`  | `VALIDATION_ERROR`    | Missing or invalid fields                         |
| `401`  | `INVALID_CREDENTIALS` | Wrong email or password                           |
| `429`  | `ACCOUNT_BLOCKED`     | Too many failed attempts — blocked for 15 minutes |

---

#### `POST /logout`

Destroy the current session. Removes session from Redis and clears the cookie.

- **Auth required:** Yes

**Request Body:** None

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

**Errors:**

| Status | errorCode         | Cause             |
| ------ | ----------------- | ----------------- |
| `401`  | `UNAUTHENTICATED` | No active session |

---

#### `GET /session-info`

Return information about the currently active session.

- **Auth required:** Yes

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Session info fetched successfully",
  "data": {
    "userId": "6660a1b2c3d4e5f6a7b8c9d0",
    "name": "Piyush Bhul",
    "email": "piyush@example.com",
    "loginTime": "2026-06-04T10:00:00.000Z"
  },
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

**Errors:**

| Status | errorCode         | Cause             |
| ------ | ----------------- | ----------------- |
| `401`  | `UNAUTHENTICATED` | No active session |

---

### Task Endpoints

All task endpoints require an active session (authenticated via cookie).

#### `POST /tasks`

Create a new task.

- **Auth required:** Yes

**Request Body:**

```json
{
  "title": "Finish API documentation",
  "description": "Write full README with all endpoints",
  "priority": "High"
}
```

| Field         | Type   | Rules                                                      |
| ------------- | ------ | ---------------------------------------------------------- |
| `title`       | string | Required, 1–200 characters                                 |
| `description` | string | Optional, max 2000 characters. Defaults to `""`            |
| `priority`    | string | Optional. `Low`, `Medium`, or `High`. Defaults to `Medium` |

**Success — `201 Created`:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "6660b1c2d3e4f5a6b7c8d9e0",
    "title": "Finish API documentation",
    "description": "Write full README with all endpoints",
    "priority": "High",
    "userId": "6660a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2026-06-04T10:05:00.000Z",
    "updatedAt": "2026-06-04T10:05:00.000Z"
  },
  "timestamp": "2026-06-04T10:05:00.000Z"
}
```

Also invalidates this user's task list cache and increments `tasksCreated` analytics counter.

**Errors:**

| Status | errorCode          | Cause                             |
| ------ | ------------------ | --------------------------------- |
| `400`  | `VALIDATION_ERROR` | Missing title or invalid priority |
| `401`  | `UNAUTHENTICATED`  | No active session                 |

---

#### `GET /tasks`

List all tasks for the authenticated user. Results are cached in Redis for 5 minutes.

- **Auth required:** Yes

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "_id": "6660b1c2d3e4f5a6b7c8d9e0",
      "title": "Finish API documentation",
      "description": "Write full README with all endpoints",
      "priority": "High",
      "userId": "6660a1b2c3d4e5f6a7b8c9d0",
      "createdAt": "2026-06-04T10:05:00.000Z",
      "updatedAt": "2026-06-04T10:05:00.000Z"
    }
  ],
  "timestamp": "2026-06-04T10:10:00.000Z"
}
```

Returns an empty array `[]` if the user has no tasks.

**Errors:**

| Status | errorCode         | Cause             |
| ------ | ----------------- | ----------------- |
| `401`  | `UNAUTHENTICATED` | No active session |

---

#### `PUT /tasks/:id`

Update an existing task. All fields are optional — only provided fields are updated.

- **Auth required:** Yes

**URL Parameter:** `:id` — MongoDB ObjectId of the task

**Request Body** (at least one field required):

```json
{
  "title": "Finish README",
  "priority": "Medium"
}
```

| Field         | Type   | Rules                                |
| ------------- | ------ | ------------------------------------ |
| `title`       | string | Optional, 1–200 characters           |
| `description` | string | Optional, max 2000 characters        |
| `priority`    | string | Optional. `Low`, `Medium`, or `High` |

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "6660b1c2d3e4f5a6b7c8d9e0",
    "title": "Finish README",
    "description": "Write full README with all endpoints",
    "priority": "Medium",
    "userId": "6660a1b2c3d4e5f6a7b8c9d0",
    "createdAt": "2026-06-04T10:05:00.000Z",
    "updatedAt": "2026-06-04T10:15:00.000Z"
  },
  "timestamp": "2026-06-04T10:15:00.000Z"
}
```

Also invalidates this user's task list cache and increments `tasksUpdated` analytics counter.

**Errors:**

| Status | errorCode          | Cause                                         |
| ------ | ------------------ | --------------------------------------------- |
| `400`  | `VALIDATION_ERROR` | No fields provided, or invalid values         |
| `401`  | `UNAUTHENTICATED`  | No active session                             |
| `404`  | `TASK_NOT_FOUND`   | Task doesn't exist or belongs to another user |

---

#### `DELETE /tasks/:id`

Delete a task permanently.

- **Auth required:** Yes

**URL Parameter:** `:id` — MongoDB ObjectId of the task

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null,
  "timestamp": "2026-06-04T10:20:00.000Z"
}
```

Also invalidates this user's task list cache and increments `tasksDeleted` analytics counter.

**Errors:**

| Status | errorCode         | Cause                                         |
| ------ | ----------------- | --------------------------------------------- |
| `401`  | `UNAUTHENTICATED` | No active session                             |
| `404`  | `TASK_NOT_FOUND`  | Task doesn't exist or belongs to another user |

---

### Analytics Endpoint

#### `GET /analytics`

Fetch global activity counters tracked in Redis.

- **Auth required:** Yes

**Success — `200 OK`:**

```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "totalLogins": 42,
    "tasksCreated": 130,
    "tasksUpdated": 58,
    "tasksDeleted": 17
  },
  "timestamp": "2026-06-04T10:25:00.000Z"
}
```

All counters default to `0` if no activity has occurred yet.

**Errors:**

| Status | errorCode         | Cause             |
| ------ | ----------------- | ----------------- |
| `401`  | `UNAUTHENTICATED` | No active session |

---

### Rate Limiting

All endpoints are rate-limited. Responses include headers indicating current limit status:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 17
```

If the limit is exceeded:

**`429 Too Many Requests`:**

```json
{
  "success": false,
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in a minute.",
  "timestamp": "2026-06-04T10:30:00.000Z"
}
```

---

## Redis Usage

This project uses Redis for five distinct purposes. All key patterns are defined as constants in `src/constants/redis.keys.js`

### 1. Session Store

Stores authenticated user sessions via a custom `IoRedisStore` (extends `express-session`'s `Store` class).

| Property    | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Key pattern | `sess:{sessionId}`                                              |
| TTL         | `SESSION_EXPIRY_SECONDS` (default: 86400s / 24 hours)           |
| Data stored | `{ user: { userId, name, email, loginTime }, cookie: { ... } }` |
| Set on      | Successful login (`POST /login`)                                |
| Deleted on  | Logout (`POST /logout`) or TTL expiry                           |
| TTL reset   | On every active request via `store.touch()`                     |

### 2. Rate Limiting

Tracks request count per IP address within a sliding window using atomic `INCR`.

| Property    | Value                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| Key pattern | `rate_limit:{ip}`                                                             |
| Window      | `RATE_LIMIT_WINDOW_MS` (default: 60000ms / 1 minute)                          |
| Limit       | `RATE_LIMIT_MAX` (default: 20 requests per window)                            |
| TTL         | Set via `PEXPIRE` on the first request in each window only                    |
| Behaviour   | Returns `429` when count exceeds limit; resets automatically when key expires |

`INCR` is atomic — no race conditions, no need for Lua scripts at this scale.

### 3. Task List Cache

Caches the full task list for each user to avoid repeated MongoDB queries.

| Property       | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| Key pattern    | `tasks_cache:{userId}`                                         |
| TTL            | 300 seconds (5 minutes)                                        |
| Set on         | First `GET /tasks` after a cache miss                          |
| Invalidated on | Any create, update, or delete operation on the user's tasks    |
| Data stored    | JSON-serialized array of task documents (from `.lean()` query) |

Cache-aside pattern: read from cache → on miss, read from MongoDB → write to cache.

### 4. Login Attempt Tracking

Tracks consecutive failed login attempts per email address to prevent brute-force attacks.

| Property       | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| Key pattern    | `login_attempts:{email}`                                        |
| Max attempts   | `LOGIN_MAX_ATTEMPTS` (default: 5)                               |
| Block duration | `LOGIN_BLOCK_DURATION_SECONDS` (default: 900s / 15 minutes)     |
| Incremented on | Each failed login attempt                                       |
| Reset on       | Successful login (`DEL` key)                                    |
| Auto-expires   | After `LOGIN_BLOCK_DURATION_SECONDS` — no manual unblock needed |

Uses `MULTI/EXEC` pipeline to atomically `INCR` + `EXPIRE` in a single round-trip.

### 5. Analytics Counters

Tracks global activity counts in a single Redis `HASH` using `HINCRBY` (atomic increment).

| Property       | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| Key pattern    | `analytics:global`                                            |
| Type           | Redis HASH                                                    |
| Fields         | `totalLogins`, `tasksCreated`, `tasksUpdated`, `tasksDeleted` |
| Incremented on | Each corresponding user action                                |
| TTL            | None — counters persist indefinitely                          |

`HGETALL` returns `null` if the key doesn't exist — all fields default to `0` when not yet set.

---

## Project Structure

```
task-management-api/
│
├── server.js                        # Entry point — connects DB + Redis, starts HTTP server
├── docker-compose.yml               # MongoDB  + Redis containers with persistent volumes
├── package.json                     # Dependencies, scripts, ESM config ("type": "module")
├── nodemon.json                     # nodemon config — watches src/, restarts on change
├── eslint.config.mjs                # ESLint flat config
├── .prettierrc                      # Prettier formatting rules
├── .commitlintrc.json               # Commitlint — enforces conventional commit format
├── .lintstagedrc.json               # lint-staged — runs ESLint + Prettier on staged files
├── .env                             # Local environment variables (gitignored)
├── .env.example                     # Template — all required variables with descriptions
├── .gitignore                       # Ignores node_modules, .env, logs, build artifacts
│
├── .husky/
│   ├── pre-commit                   # Runs lint-staged before every commit
│   └── commit-msg                   # Runs commitlint to validate commit message format
│
└── src/
    │
    ├── app.js                       # Express app setup — middleware, session, routes, error handler
    │
    ├── config/
    │   ├── index.js                 # envalid env validation — app refuses to start if vars missing
    │   ├── database.js              # Mongoose connection with event logging + graceful disconnect
    │   ├── redis.js                 # ioredis client + custom IoRedisStore (replaces connect-redis)
    │   └── logger.js                # Winston — pretty logs in dev, JSON in production
    │
    ├── constants/
    │   ├── redis.keys.js            # All Redis key patterns as functions
    │   ├── http.status.js           # Named HTTP status codes — no magic numbers
    │   └── messages.js              # All error/success message strings + error code constants
    │
    ├── models/
    │   ├── user.model.js            # Mongoose User schema
    │   └── task.model.js            # Mongoose Task schema
    │
    ├── validators/
    │   ├── auth.validator.js        # Zod  schemas for /register and /login
    │   └── task.validator.js        # Zod  schemas for task create and update
    │
    ├── middleware/
    │   ├── errorHandler.js          # Central 4-arg error handler — last middleware in app.js
    │   ├── requestLogger.js         # Winston request logger — method, path, status, duration
    │   ├── rateLimiter.js           # Redis INCR rate limiter — 20 req/min per IP
    │   ├── auth.middleware.js       # Session auth check — attaches req.user from session
    │   └── validate.js              # Zod validation factory — sets req.validatedBody
    │
    ├── services/
    │   ├── auth.service.js          # register, login (with attempt tracking), logout logic
    │   ├── task.service.js          # Task CRUD + cache invalidation + analytics increment
    │   ├── cache.service.js         # Generic Redis get/set/del helpers (JSON serialization)
    │   └── analytics.service.js    # Redis HINCRBY counters — increment + getAnalytics
    │
    ├── controllers/
    │   ├── auth.controller.js       # Thin layer — extract req, call service, send ApiResponse
    │   ├── task.controller.js       # Thin layer — extract req, call service, send ApiResponse
    │   └── analytics.controller.js # Thin layer — call service, send ApiResponse
    │
    ├── routes/
    │   ├── index.js                 # Root router — mounts all sub-routers + 404 handler
    │   ├── auth.routes.js           # POST /register, /login, /logout  |  GET /session-info
    │   ├── task.routes.js           # CRUD /tasks — all routes protected by requireAuth
    │   └── analytics.routes.js     # GET /analytics — protected by requireAuth
    │
    └── utils/
        ├── ApiError.js              # Custom error class — statusCode, errorCode, isOperational
        ├── ApiResponse.js           # Consistent success response wrapper — success, message, data
        ├── asyncHandler.js          # Express  fallback wrapper for async route handlers
        └── password.js              # bcrypt hash + compare helpers — 12 rounds minimum
```
