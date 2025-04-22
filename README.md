# stripe-for-node


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

// Example: creates a new Customer

await stripe = stripeHelper.createAccount('test@example.com')
