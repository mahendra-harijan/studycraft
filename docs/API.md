# EngineerHub REST API

Base URL: `http://localhost:4000`

All requests use JSON unless file upload is specified. Authenticated routes require `accessToken` cookie and CSRF header.

## Security Headers
- `csrf-token: <token from meta tag>` for all state-changing requests.
- Cookies are `HttpOnly`, `SameSite=Strict`, `Secure` in production.

## Auth
- `POST /api/auth/signup`
  - body: `{ fullName, email, password }`
- `POST /api/auth/login`
  - body: `{ email, password }`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile` (multipart)
  - fields: `fullName`, `avatar`

## Scheduler
- `GET /api/schedules`
- `POST /api/schedules`
  - body: `{ subject, day, startTime, endTime, venue, weeklyRepeat }`
- `PUT /api/schedules/:id`
- `DELETE /api/schedules/:id`

## Tasks
- `GET /api/tasks`
- `POST /api/tasks`
  - body: `{ title, description, deadline, reminderAt, priority }`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/read`

## Dashboard
- `GET /api/dashboard/overview`

## Tools (No auth middleware)
- `POST /api/tools/matrix`
  - body: `{ operation, matrixA, matrixB }`
- `POST /api/tools/crypto`
  - body: `{ operation, a, b, n }`

## Status Codes
- `200` success
- `201` created
- `401` unauthorized
- `403` CSRF/forbidden
- `404` not found
- `409` conflict
- `422` validation error
- `429` rate limited
- `500` internal server error
