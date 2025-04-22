# stripe-for-node


## Features

- Automatically loads Stripe secret key depending on environment
- Creates Stripe customer accounts
- Creates Stripe charges
- Creates Stripe transfers
- Retrieves Stripe account balances
- Retrieves Stripe account details
- Updates Stripe account details
- Creates Stripe bank accounts
- Creates Stripe cards
- Retrieves Stripe cards
- Creates Stripe payment intents
- Confirms Stripe payment intents

## Environment Variables

- `NODE_ENV` — set to `production` or `development`
- `STRIPE_KEY_PROD` — your live secret key
- `STRIPE_KEY_TEST` — your test secret key

## Usage

```js
require('dotenv').config()
const stripe = require('stripe-for-node')

// Example: creates a new Customer

await stripe = stripe.createAccount('test@example.com')

## 🔧 Function: `updateAccount(stripeId, name, address)`

This function updates an existing Stripe customer with a new name and/or address.

### 🧾 Parameters:

- `stripeId` *(string)* — The Stripe customer ID you want to update (e.g., `cus_P5kT4M6s8N7abc`)
- `name` *(string)* — The new name for the customer
- `address` *(object)* — A Stripe-compatible address object:

```js
{
  line1: '123 Main Street',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'US'
}
