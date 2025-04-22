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

## 🌐 Environment Variables

Set up your `.env` file with the following variables:

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `NODE_ENV`         | Should be `production` or `development`  |
| `STRIPE_KEY_PROD`  | Your **Live** Stripe Secret Key          |
| `STRIPE_KEY_TEST`  | Your **Test** Stripe Secret Key          |

## Usage

```js
require('dotenv').config()
const stripe = require('stripe-for-node')

// Example: Creates a new Customer
const customer = await stripe.createAccount('test@example.com')
console.log(customer)

