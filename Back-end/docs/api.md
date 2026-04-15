# ShopWave Backend API Documentation

## Base URL

- `http://localhost:8080`
- All routes are prefixed with `/api`

## Content Type

- Request body: `Content-Type: application/json`
- Responses: JSON, unless otherwise noted

## Environment Variables

Required application settings:

- `PORT` - server port, default `8080`
- `MONGODB_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT access-token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh-token secret

Paymob settings:

- `PAYMOB_SECRET_KEY` - used for Paymob Intention API requests
- `PAYMOB_PUBLIC_KEY` - used to build the unified checkout URL
- `PAYMOB_INTEGRATION_ID` - fallback payment method id if none is sent in the request body
- `PAYMOB_BASE_URL` - default `https://accept.paymob.com/api`
- `PAYMOB_INTENTION_BASE_URL` - default `https://accept.paymob.com`
- `PAYMOB_PORTAL_BASE_URL` - default `https://portal.paymob.com`
- `PAYMOB_UNIFIED_CHECKOUT_BASE_URL` - optional explicit unified checkout host override
- `PAYMOB_REDIRECTION_URL` - browser return URL Paymob should redirect to after payment
- `FRONTEND_PAYMENT_RESULT_URL` - frontend page the backend return endpoint redirects to
- `PAYMENT_WEBHOOK_SECRET` - used to verify webhook signatures
- `PAYMENT_PROVIDER_S2S_VERIFY_ENABLED` - optional server-to-server verification toggle
- `PAYMOB_VERIFY_TRANSACTION_ENDPOINT` - optional verification endpoint override
- `PAYMOB_API_KEY` - optional legacy fallback for verification compatibility

## Auth Overview

This API uses JWT Bearer tokens for protected routes.

- Send header: `Authorization: Bearer <accessToken>`
- Login also sets an HttpOnly `refreshToken` cookie

## Standard Response Shape

Most endpoints respond like:

```json
{
  "message": "...",
  "data": {}
}
```

Note: cart endpoints currently return `Message` with a capital `M` in some responses.

## Errors

- Validation errors: `400`
  - Response body usually contains a validation message such as `Validation Error`
- Duplicate key errors from MongoDB: `400`
  - Response is commonly an array of strings
- Authentication/authorization errors: `401` or `403`
- Unhandled errors: `500`

## Data Models

### User

- `name` - string, required
- `email` - string, required, unique
- `password` - string, required, stored hashed
- `role` - `user` | `admin`, default `user`

### Category

- `name` - string, required, unique

### Product

- `title` - string, required
- `description` - string, required
- `image` - string, optional, defaults to a product image URL
- `price` - number, required, min 0
- `inStock` - `yes` | `no`, default `yes`
- `category` - ObjectId reference to `Category`, required

### Cart

- `user` - ObjectId reference to `User`, required
- `products[]`
  - `product` - ObjectId reference to `Product`, required
  - `quantity` - number, min 1, default 1

### PaymentTransaction

- `user` - ObjectId reference to `User`
- `merchantOrderId` - string, unique
- `providerOrderId` - string
- `providerTransactionId` - string
- `amountCents` - number
- `currency` - string
- `status` - `pending` | `paid` | `failed`
- `paidAt` - date
- `webhookMeta` - raw provider payload snapshot

## Endpoints

## Authentication

### Register

- **POST** `/api/register`

Request body:

```json
{
  "name": "Merlin",
  "email": "merlin@example.com",
  "password": "secret123",
  "role": "user"
}
```

Response: `200`

### Login

- **POST** `/api/login`

Request body:

```json
{
  "email": "merlin@example.com",
  "password": "secret123"
}
```

Response: `200`

Response body includes:

```json
{
  "message": "Hi Merlin U loggedIn successfully!",
  "token": "<accessToken>",
  "user": {
    "_id": "...",
    "name": "Merlin",
    "email": "merlin@example.com",
    "role": "user"
  }
}
```

### Current user

- **GET** `/api/me`
- **Auth required:** `Authorization: Bearer <accessToken>`

Response: `200`

```json
{
  "message": "Retrieved Successfully!",
  "data": ["Merlin", "user"]
}
```

### Refresh access token

- **POST** `/api/refresh`
- **Cookie required:** `refreshToken`

Response: `200`

```json
{
  "message": "U refreshed successfully!",
  "accessToken": "<newAccessToken>"
}
```

### Logout

- **POST** `/api/logout`
- **Auth required:** `Authorization: Bearer <accessToken>`
- **Cookie required:** `refreshToken`

Response: `200`

## Users

Auth: **Admin only**

### Get all users

- **GET** `/api/users`

Response: `200`

```json
{
  "message": "User retrieved successfully!",
  "data": []
}
```

### Create user

- **POST** `/api/users`

Request body:

```json
{
  "name": "Merlin",
  "email": "merlin@example.com",
  "password": "secret123",
  "role": "user"
}
```

Response: `200`

### Get user by id

- **GET** `/api/users/:id`

Response: `200`

### Update user

- **PUT** `/api/users/:id`

Response: `200`

### Delete user

- **DELETE** `/api/users/:id`

Response: `200`

## Categories

### Get all categories

- **GET** `/api/category`

Response: `200`

```json
{
  "message": "Retrieved Successfully",
  "data": []
}
```

### Create category

- **POST** `/api/category`
- **Auth required:** admin only

Request body:

```json
{
  "name": "Electronics"
}
```

Response: `201`

```json
{
  "message": "Category Created Successfully!",
  "data": {
    "id": "<CategoryObjectId>",
    "name": "Electronics"
  }
}
```

### Get products by category

- **GET** `/api/category/:id/products`

Response: `200`

```json
{
  "message": "Retrieved Successfully",
  "data": []
}
```

## Products

### Get all products

- **GET** `/api/products?page=1&limit=10`

Response: `200`

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "totalPages": 0
}
```

### Create product

- **POST** `/api/products`
- **Auth required:** admin only

Request body:

```json
{
  "title": "iPhone 15",
  "description": "Latest Apple phone",
  "price": 999,
  "inStock": "yes",
  "category": "<CategoryObjectId>",
  "image": "https://example.com/image.jpg"
}
```

Notes:

- The upload middleware also accepts `multipart/form-data` with an `imageFile` field.
- If no uploaded file is present, the backend uses the `image` field from the request body.

Response: `201`

### Get product by id

- **GET** `/api/products/:id`

Response: `200`

```json
{
  "message": "Got it Successfully!",
  "data": {
    "_id": "...",
    "title": "iPhone 15",
    "description": "Latest Apple phone",
    "price": 999,
    "inStock": "yes",
    "category": {
      "_id": "...",
      "name": "Electronics"
    }
  }
}
```

### Update product

- **PUT** `/api/products/:id`
- **Auth required:** admin only

Response: `200`

### Delete product

- **DELETE** `/api/products/:id`
- **Auth required:** admin only

Response: `204`

## Carts

All cart routes are scoped to a user id in the URL.

- **Auth required** for all cart routes
- Admin can access any cart
- Normal users can only access their own cart

### Get cart

- **GET** `/api/carts/user/:userId`

Response: `200`

### Add to cart

- **POST** `/api/carts/user/:userId`

Request body:

```json
{
  "productId": "<ProductObjectId>",
  "quantity": 2
}
```

Response: `201`

### Update cart quantity

- **PATCH** `/api/carts/user/:userId`

Request body:

```json
{
  "productId": "<ProductObjectId>",
  "quantity": 3
}
```

Response: `200`

### Remove from cart

- **DELETE** `/api/carts/user/:userId`

Request body:

```json
{
  "productId": "<ProductObjectId>"
}
```

Response: `200`

## Payments

### Create Paymob checkout

- **POST** `/api/payments/paymob/checkout`
- **Auth required:** access token

Request body:

```json
{
  "amountCents": 27000,
  "currency": "EGP",
  "payment_methods": [5617734],
  "billing_data": {
    "first_name": "Merlin",
    "last_name": "User",
    "email": "merlin@example.com",
    "phone_number": "+201000000000"
  }
}
```

Response: `201`

```json
{
  "message": "Checkout URL created",
  "clientSecret": "<paymob-client-secret>",
  "checkoutUrl": "https://accept.paymob.com/unifiedcheckout/...",
  "merchantOrderId": "sw-<timestamp>-<userId>"
}
```

### Paymob webhook

- **POST** `/api/payments/paymob/webhook`

Notes:

- The request must include a valid signature header.
- Accepted signature headers: `x-paymob-signature` or `x-paymob-hmac`
- The backend uses the raw request body for verification.

Responses:

- `200` when payment is confirmed or already processed
- `202` when the webhook payload is valid but not successful
- `401` when the signature is invalid

### Paymob return redirect

- **GET** `/api/payments/paymob/return`

Notes:

- Paymob should redirect the browser here after payment.
- This endpoint redirects again to `FRONTEND_PAYMENT_RESULT_URL`.

### Payment status

- **GET** `/api/payments/paymob/status/:merchantOrderId`
- **Auth required:** access token

Response: `200`

```json
{
  "merchantOrderId": "sw-...",
  "status": "pending",
  "paidAt": null,
  "amountCents": 27000,
  "currency": "EGP"
}
```

### User payment history

- **GET** `/api/payments/paymob/orders?limit=50`
- **Auth required:** access token

Response: `200`

```json
{
  "count": 1,
  "data": []
}
```

## Validation Notes

- Validation is handled by `express-validator` in the route layer.
- Invalid input returns `400` with a validation message.
- Route-specific validation files live in `middlewares/validations/`.

## Testing

- Use `api.http` for REST Client testing in VS Code.
- Use `docs/api.md` as the canonical endpoint reference.

```json
{
  "Message": "create Successfully!",
  "data": {
    "_id": "...",
    "user": "<UserObjectId>",
    "products": [
      {
        "product": "<ProductObjectId>",
        "quantity": 2
      }
    ]
  }
}
```

### Get user cart

- **GET** `/api/carts/user/:userId`

Response: `200`

- If the cart does not exist yet, `data` will be `null`.

### Delete product from cart

- **DELETE** `/api/carts/user/:userId`

Request body:

```json
{
  "productId": "<ProductObjectId>"
}
```

Response: `200`

```json
{
  "Message": "Deleted Successfully!",
  "data": {
    "_id": "...",
    "user": "<UserObjectId>",
    "products": []
  }
}
```

---

## Testing

For a ready-made request collection, use the VS Code REST Client file:

- `api.http`
