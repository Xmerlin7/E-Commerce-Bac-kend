# ShopWave Backend

Express + MongoDB API for ShopWave. The backend covers authentication, users, categories, products, carts, and Paymob payments.

## Quick Start

Install dependencies:

```bash
npm install
```

Configure the environment in `.env`:

```dotenv
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecommerce
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

PAYMOB_SECRET_KEY=your-paymob-secret-key
PAYMOB_PUBLIC_KEY=your-paymob-public-key
PAYMOB_INTEGRATION_ID=your-paymob-integration-id
PAYMOB_BASE_URL=https://accept.paymob.com/api
PAYMOB_INTENTION_BASE_URL=https://accept.paymob.com
PAYMOB_PORTAL_BASE_URL=https://portal.paymob.com
PAYMOB_REDIRECTION_URL=http://localhost:8080/api/payments/paymob/return
FRONTEND_PAYMENT_RESULT_URL=http://localhost:4200/payment-result
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
PAYMENT_PROVIDER_S2S_VERIFY_ENABLED=false
PAYMOB_VERIFY_TRANSACTION_ENDPOINT=/acceptance/transactions/:id
```

Run the API:

```bash
npm run dev
```

Default backend URL:

```text
http://localhost:8080
```

## Features

- JWT auth with access and refresh tokens
- Role-based access control
- Users, categories, and products CRUD
- Cart management per user
- Paymob unified checkout integration
- Paymob webhook processing
- Payment return redirect and payment status polling

## Project Layout

- `app.js` - Express app setup and middleware
- `server.js` - HTTP server bootstrap
- `routes/` - API route definitions
- `controllers/` - request handlers
- `services/` - business logic and data access
- `models/` - Mongoose schemas
- `middlewares/` - auth, validation, error handling, uploads
- `docs/api.md` - API reference
- `api.http` - REST Client request examples

## Authentication

- Login returns a JWT access token in the response body.
- Login also sets an HttpOnly `refreshToken` cookie.
- Protected routes use `Authorization: Bearer <accessToken>`.

Role rules:

- Admin-only routes include user management, category creation, product creation, updates, and deletes.
- Cart and payment status routes require authentication.

## Development Notes

- Validation is implemented with `express-validator`.
- Payment return handling requires `FRONTEND_PAYMENT_RESULT_URL`.
- Paymob webhook verification requires `PAYMENT_WEBHOOK_SECRET`.
- If you run the frontend on a different URL or port, update the Paymob redirect URLs accordingly.

## Testing

Use `api.http` in VS Code REST Client to exercise the backend endpoints.

## Documentation

- API reference: `docs/api.md`
- Request examples: `api.http`
