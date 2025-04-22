# stripe-env-helper

Simple utility wrapper for Stripe that auto-selects keys based on `NODE_ENV`.

## Features

- Automatically loads Stripe secret key depending on environment
- Creates Stripe customer accounts

## Environment Variables

- `NODE_ENV` — set to `production` or `development`
- `STRIPE_KEY_PROD` — your live secret key
- `STRIPE_KEY_TEST` — your test secret key

## Usage

```js
require('dotenv').config()
const stripe = require('stripe-helper')

await stripe = stripeHelper.createAccount('test@example.com')
