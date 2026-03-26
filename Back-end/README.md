# Day 4 – E-Commerce API

Node.js (Express) + MongoDB (Mongoose) CRUD API for Users, Categories, Products, and Carts.

## Quickstart

1. Install dependencies

```bash
npm i
```

1. Configure env

The repo already includes a `.env` with defaults:

- `PORT=8080`
- `DB_URI=mongodb://localhost:27017/ecommerce`
- `ACCESS_TOKEN_SECRET=...` (required for auth)
- `REFRESH_TOKEN_SECRET=...` (required for auth)

1. Run

```bash
npm run dev
```

Server runs on: `http://localhost:8080`

## Auth & Roles

- Login returns an **access token** (JWT). Send it on protected routes:
  - `Authorization: Bearer <accessToken>`
- Login also sets an HttpOnly cookie `refreshToken` used by:
  - `POST /api/refresh`
  - `POST /api/logout`

Role rules (current implementation):

- Admin-only:
  - `POST /api/category`
  - `POST /api/products`
  - `GET/POST /api/users`
- Cart endpoints require auth; non-admin users can only access their own cart via `:userId`.

## Validation

Request validation uses `express-validator` and is wired in the route files.

- Validators live in `middlewares/validations/*.validators.js`
- Handler is `middlewares/validations/validatorHandler.js`
- On invalid input you’ll get `400` with message `Validation Error`

## Testing (VS Code)

Use the REST Client file to test all endpoints:

- `api.http`

## API Documentation

See: `docs/api.md`
