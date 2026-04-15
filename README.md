# ShopWave

ShopWave is a full-stack e-commerce project with an Angular frontend and an Express + MongoDB backend. It supports authentication, products, categories, carts, orders, and Paymob checkout/payment status handling.

## Project Structure

- `Back-end/` - Express API, MongoDB models, payment integration, validation, and REST endpoints
- `Front-end/` - Angular storefront and admin UI
- `Back-end/docs/` - API documentation
- `Back-end/api.http` - REST Client requests for backend testing

## Requirements

- Node.js 20+ recommended
- npm
- MongoDB running locally or via Docker
- Paymob credentials for checkout and webhook flow

## Setup

Install dependencies for both apps:

```bash
cd Back-end
npm install

cd ../Front-end
npm install
```

## Environment Variables

### Backend

Copy and fill `Back-end/.env` with values like:

```dotenv
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecommerce
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

PAYMOB_SECRET_KEY=your-paymob-secret-key
PAYMOB_PUBLIC_KEY=your-paymob-public-key
PAYMOB_INTEGRATION_ID=your-paymob-integration-id
PAYMOB_BASE_URL=https://accept.paymob.com/api
PAYMOB_INTENTION_BASE_URL=https://accept.paymob.com
PAYMOB_PORTAL_BASE_URL=https://portal.paymob.com
PAYMOB_REDIRECTION_URL=http://localhost:8080/api/payments/paymob/return
FRONTEND_PAYMENT_RESULT_URL=http://localhost:4200/payment-result
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
```

### Frontend

The frontend uses `Front-end/src/environment/environment.ts` for API configuration.

Make sure it points to the backend API and includes the Paymob integration id:

```ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api",
  paymobIntegrationId: YOUR_PAYMOB_INTEGRATION_ID,
};
```

## Run Locally

Start the backend in one terminal:

```bash
cd Back-end
npm run dev
```

Start the frontend in another terminal:

```bash
cd Front-end
npm start
```

By default:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:4200`

## Docker

A `docker-compose.yml` exists in `Back-end/` for local container-based setup. If you prefer Docker, start the services from that directory and ensure the backend is pointed at the correct MongoDB host.

## Features

### Backend

- User registration, login, logout, refresh token flow
- Role-based access control
- Categories and products CRUD
- Cart management per user
- Paymob checkout creation
- Payment return redirect handling
- Paymob webhook processing
- Payment status polling and order history

### Frontend

- Home page and product browsing
- Login and registration pages
- Cart page with quantity updates and checkout
- Payment result page that polls payment status
- Orders page
- Admin dashboard and product management pages

## Payment Flow

1. The frontend sends a checkout request to the backend.
2. The backend creates a Paymob intention and returns a checkout URL.
3. The user completes payment on Paymob.
4. Paymob redirects the browser to the backend return URL.
5. The backend redirects the browser to the frontend payment result page.
6. The frontend polls the backend payment status endpoint until the final payment state is available.
7. Paymob webhooks update the payment record server-side.

## API Documentation

See:

- `Back-end/docs/api.md`
- `Back-end/api.http`

## Notes

- Backend auth uses JWT access and refresh tokens.
- Cart routes require authentication.
- Payment-related endpoints expect the Paymob env values to be configured correctly.
- If you change the backend port or frontend URL, update the matching redirect and result URLs as well.

## Useful Commands

Backend:

```bash
cd Back-end
npm run dev
```

Frontend:

```bash
cd Front-end
npm start
npm run build
npm test
```

## Status

This repository is organized as a two-app workspace. The backend and frontend each have their own local README files, but this root README is the main project entry point.
