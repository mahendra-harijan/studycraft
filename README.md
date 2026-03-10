# EngineerHub (Secure Full-Stack App)

EngineerHub is a production-ready, security-hardened Node.js + Express + MongoDB application with EJS frontend.

## Features
- Secure signup/login with bcrypt  JWT access/refresh cookies
- Account lockout after repeated failed login attempts
- Smart class scheduler with clash detection and duplicate prevention
- Task/reminder management with deadline safety
- Dashboard (today classes, upcoming tasks, storage usage, notifications)
- Service Worker + browser notifications
- Scientific + matrix + crypto calculators (no `eval()`)
- Secure profile update with validated Cloudinary upload

## Security Controls
- Helmet + CSP + disabled `X-Powered-By`
- Strict CORS policy
- CSRF protection using `csurf`
- Rate limiting (global + auth routes)
- Input validation and sanitization (`express-validator`, `express-mongo-sanitize`, `hpp`)
- Centralized error handling with safe error responses
- No secrets in source code

## Project Structure
- `src/` backend (routes, controllers, middleware, models, services)
- `views/` EJS pages + partials
- `public/` CSS, JS, service worker
- `docs/API.md` REST API documentation

## Prerequisites
- Node.js 20+
- MongoDB running locally or remotely
- Cloudinary account (for avatar storage)

## Installation
1. Open terminal in project folder:
   ```bash
   cd c:\Users\Mahendra\Desktop\TechHub\project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create env file:
   ```bash
   copy .env.production.example .env
   ```


## Enable Browser-Closed Push Notifications
1. Generate VAPID keys:
   ```bash
   npm run vapid:keys
   ```

3. Restart app and open `/dashboard`, allow notification permission.
4. Subscription is stored server-side and scheduled reminders are sent as Web Push.

Note: for reliable push delivery in production, run over HTTPS.

## Run (Development)
```bash
npm run dev
```

App URL: `http://localhost:4000`

## Run (Production)
```bash
set NODE_ENV=production
npm start
```

## How to Use
1. Open `/signup` and create account
2. Login from `/login`
3. Use `/scheduler` to add classes
4. Use `/tasks` to add reminders
5. View `/dashboard` for daily view and alerts
6. Use `/calculator` and `/crypto-calculator` for tools

## Notes
- JWTs are not stored in localStorage; only secure cookies are used.
- Tool endpoints intentionally do not require auth middleware per requirement.
- For production HTTPS, set `COOKIE_SECURE=true`.
