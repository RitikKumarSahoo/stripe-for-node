# stripe-for-node

A simple and extensible wrapper for the Stripe API supporting customer creation, account management, and various Stripe operations.

## Installation

```bash
npm install stripe-for-node
```

## 🌐 Environment Variables

Set up your `.env` file with the following variables:

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `NODE_ENV`         | Should be `production` or `development`  |
| `STRIPE_KEY_PROD`  | Your **Live** Stripe Secret Key          |
| `STRIPE_KEY_TEST`  | Your **Test** Stripe Secret Key          |
| `HOME_PAGE`        | redirect URL after Stripe account onboarding/KYC processes |  
| `PRODUCT_NAME`     | Your product name for statement descriptor |
| `PRODUCT_WEBSITE_URL` | Your business website URL used in Stripe business profile |
| `DO_SPLIT_PAYMENT` | Set to `true` to enable split payments |

## Usage

First, import and configure the package:

```javascript
require('dotenv').config()
const stripe = require('stripe-for-node')
```

### Creating a Customer Account

Create a new Stripe customer with an email address.

```javascript
// Create customer
const customer = await stripe.createAccount('customer@example.com')

// Response example:
{
  id: 'cus_xxx',
  email: 'customer@example.com',
  object: 'customer'
  // ... other Stripe customer properties
}
```

### Updating Customer Details

Update an existing customer's name and address.

```javascript
const stripeId = 'cus_xxx' // Stripe customer ID
const name = 'John Doe'
const address = {
  line1: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postal_code: '94111',
  country: 'US'
}

const updatedCustomer = await stripe.updateAccount(stripeId, name, address)
```

## API Reference

### stripe.createAccount(email)
Creates a new Stripe customer account.

**Parameters:**
- `email` (string, required): Customer's email address

**Returns:** Promise resolving to Stripe Customer object

### stripe.updateAccount(stripeId, name, address)
Updates an existing customer's details.

**Parameters:**
- `stripeId` (string, required): Stripe customer ID
- `name` (string, required): Customer's full name
- `address` (object, required): Customer's address containing:
  - `line1` (string): Street address
  - `city` (string): City
  - `state` (string): State/Province
  - `postal_code` (string): ZIP/Postal code
  - `country` (string): Two-letter country code

**Returns:** Promise resolving to updated Stripe Customer object

## Error Handling

The package uses Promise-based error handling. Wrap your calls in try-catch blocks:

```javascript
try {
  const customer = await stripe.createAccount('customer@example.com')
  console.log('Customer created:', customer)
} catch (error) {
  console.error('Error:', error.message)
}
```
### Example
All methods return promises and should be used with try-catch blocks:
```javascript
try {
  const result = await stripe.methodName(params)
} catch (error) {
  console.error('Error:', error.message)
}
```
#### createVendor(email, country)
Creates a new Stripe Custom Connect account for vendors.
- `email` (string): Vendor's email address
- `country` (string): Two-letter country code (e.g., 'US', 'GB')

#### deleteAccount(stripeId)
Delete a Stripe account (customer).
- `stripeId` (string): Stripe account ID to delete

## Card Operations

### Create Card Token
Creates a token for card information.

```javascript
const cardToken = await stripe.createAccountToken({
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2024,
    cvc: '123'
  }
})
```

### Add Card to Customer
Adds a card to an existing customer using the card token.

```javascript
const customerId = 'cus_xxx'
const cardToken = 'tok_xxx'
const card = await stripe.addCard(customerId, cardToken)
```
### setDefaultCard(stripeCustomerId, stripeCardId)
Sets a card as the default payment method.
- `stripeCustomerId` (string): Customer ID (e.g., 'cus_xxx')
- `stripeCardId` (string): Card ID to set as default (e.g., 'card_xxx')

### fetchCard(id)
Retrieves card with default card flag.
- `id` (string): Customer ID (e.g., 'cus_xxx')

### deleteCard(id, cardId)
Removes a card from customer's payment methods.
- `id` (string): Customer ID (e.g., 'cus_xxx')
- `cardId` (string): Card ID to delete (e.g., 'card_xxx')

### addBankInfo(stripeId, routingNo, accountNo, accountHolderName = null, country, currency = "usd")
Adds a bank account to a Stripe account.
- `stripeId` (string): Customer ID (e.g., 'cus_xxx')
- `routingNo` (string): Bank routing number
- `accountNo` (string): Bank account number
- `accountHolderName` (string, optional): Account holder name
- `country` (string): Two-letter country code (e.g., 'US')
- `currency` (string, optional): Currency code (default: "usd")

Note: Routing number not required for EUR/NOK currencies

### addPayoutCard(stripeId, cardid)
Adds a card for payout method.
- `stripeId` (string): Customer ID (e.g., 'cus_xxx')
- `cardid` (string): Card ID (e.g., 'card_xxx')

### getExternalAccounts(stripeId)
Lists all external accounts (bank accounts and cards).
- `stripeId` (string): Customer ID (e.g., 'cus_xxx')

### removeExternalAccount(stripeId, accountId)
Removes an external account (bank account or card).
- `stripeId` (string): Customer ID (e.g., 'cus_xxx')
- `accountId` (string): External account ID (e.g., 'ba_xxx' or 'card_xxx')

### updateExternalAccountDefault(stripeId, accountId)
Sets an external account as default for its currency.
- `stripeId` (string): Customer ID (e.g., 'cus_xxx')
- `accountId` (string): External account ID (e.g., 'ba_xxx' or 'card_xxx')

## KYC Methods

### vendorKyc(stripeId, email, phone, address, dob, name, remoteAddress, docs, ssnLastFour = null, personalIdNumber = null, category = null)
Note: - `PRODUCT_WEBSITE_URL`: Your business website URL used in Stripe business profile
Updates account with KYC (Know Your Customer) information.
- `stripeId` (string): Stripe account ID
- `email` (string): Vendor's email address
- `phone` (string): Phone number
- `address` (object): Address object containing country and other address details
- `dob` (object): Date of birth object
- `name` (object): Object containing `first` and `last` name
- `remoteAddress` (string): IP address for TOS acceptance
- `docs` (object, optional): Verification documents
- `ssnLastFour` (string, optional): Last 4 digits of SSN (for US)
- `personalIdNumber` (string, optional): ID number (SSN for US, PAN for IN)
- `category` (string, optional): Either "Business" or "Individual"


Note: Different fields are required based on country (US/IN)

### acceptTosOnly(stripeId, remoteAddress)
Accepts Terms of Service for a Stripe account.
- `PRODUCT_WEBSITE_URL`: Your business website URL used in Stripe business profile
- `stripeId` (string): Stripe account ID
- `remoteAddress` (string): IP address for TOS acceptance

### connectAccountCharge(vendorId, amount)
Creates a direct charge to a connected Stripe account.
- `vendorId`: Stripe account ID of the vendor
- `amount`: Charge amount in dollars (automatically converted to cents)

### Payment(customer, vendor, amount, vendorAmount, description?, currency?, receiptEmail?, statementDescriptor?, capture?)
Creates a payment charge with optional split payment functionality.
- `customer`: Stripe customer ID
- `vendor`: Vendor's Stripe account ID for split payments
- `amount`: Total charge amount in dollars
- `vendorAmount`: Amount to transfer to vendor (if split payment enabled)
- `description`: Optional payment description
- `currency`: Payment currency (default: "usd")
- `receiptEmail`: Optional email for receipt
- `statementDescriptor`: Custom statement descriptor
- `capture`: Whether to capture payment immediately (default: true)

Note: Split payments are controlled by `DO_SPLIT_PAYMENT` environment variable.

### PaymentIndia(customer, vendor, amount, vendorAmount, description?, currency?, receiptEmail?, statementDescriptor?, capture?)
Creates a basic payment charge for Indian transactions without split payment functionality.
- `customer`: Stripe customer ID
- `vendor`: Vendor's Stripe account ID (not used in this function)
- `amount`: Charge amount in dollars (converted to cents)
- `vendorAmount`: Amount parameter (not used in this function)
- `description`: Optional payment description
- `currency`: Payment currency (default: "usd")
- `receiptEmail`: Optional email for receipt
- `statementDescriptor`: Custom statement descriptor
- `capture`: Whether to capture payment immediately (default: true)

### PaymentIntent(customer, vendor, amount, vendorAmount, description)
Creates a payment intent with 3D Secure support and optional split payment.
- `customer`: Stripe customer ID
- `vendor`: Vendor's Stripe account ID for split payments
- `amount`: Total charge amount in dollars
- `vendorAmount`: Amount to transfer to vendor (if split payment enabled)
- `description`: Payment description

Features:
- Always enables 3D Secure authentication
- Supports split payments via `DO_SPLIT_PAYMENT` environment variable
- Uses `PRODUCT_NAME` for statement descriptor

## Environment Variables
- `PRODUCT_NAME`: Used in statement descriptor
- `DO_SPLIT_PAYMENT`: Controls payment splitting ("true"/"false")

### PaymentIntentIndia(customer, amount, description)
Creates a simple payment intent for Indian transactions.
- `customer`: Stripe customer ID
- `amount`: Charge amount in dollars (converted to cents)
- `description`: Payment description

Features:
- Uses USD currency
- Uses `PRODUCT_NAME` for statement descriptor

### MultiTransferPayment(customer, amount, transfers, transferGroup, currency, receiptEmail, description, statementDescriptor, capture)
Creates a payment with multiple transfers to different accounts.
- `customer`: Stripe customer ID
- `amount`: Total charge amount in dollars
- `transfers`: Array of transfer objects `[{amount: number, stripeId: string}]`
- `transferGroup`: Group identifier for the transfers
- `currency`: Payment currency (default: "usd")
- `receiptEmail`: Optional email for receipt
- `description`: Optional payment description
- `statementDescriptor`: Custom statement descriptor
- `capture`: Whether to capture payment immediately (default: true)

Features:
- Creates initial charge
- Distributes funds to multiple accounts
- Groups transfers under single transferGroup
- Returns both charge and transfer details

### payout(vendorId, vendorAmount, currency?, isInstant?, destination)
Creates a payout to a connected Stripe account.
- `vendorId`: Stripe account ID of the vendor
- `vendorAmount`: Amount to payout in dollars (converted to cents)
- `currency`: Payout currency (default: "usd")
- `isInstant`: Whether to use instant payout method (default: false)
- `destination`: Specific destination for the payout

Features:
- Supports both standard and instant payouts
- Can specify custom destination
- Executes payout on behalf of connected account

### checkBalance(vendorId)
Retrieves the current balance for a connected Stripe account.
- `vendorId`: Stripe account ID to check balance for

Returns:
- Available and pending balance information
- Balance breakdown by currency

### changeVendorPayoutSetting(vendorId)
Updates a connected account's payout schedule to manual.
- `vendorId`: Stripe account ID of the vendor

Features:
- Sets payout schedule to manual mode
- Useful for controlling when payouts are processed
- Returns updated account details

### chargeRefund(chargeId)
Creates a refund for a specific charge.
- `chargeId`: ID of the charge to refund

Features:
- Processes full refund of the charge
- Returns refund details
- Automatically handles refund processing through Stripe

### transferRefund(transferId, amount)
Creates a reversal for a previously created transfer.
- `transferId`: ID of the transfer to reverse
- `amount`: Amount to reverse in dollars (converted to cents)

Features:
- Supports partial transfer reversals
- Returns reversal details
- Automatically handles conversion to cents

### createStripeTransfer(amount, destination, transferGroup, currency)
Creates a new transfer to a connected account.
- `amount`: Amount to transfer in dollars (converted to cents)
- `destination`: Stripe account ID of the recipient
- `transferGroup`: Group identifier for the transfer
- `currency`: Transfer currency (default: "usd")

Features:
- Groups transfers for tracking related payments
- Supports multiple currencies
- Returns transfer details

### fileUpload(url, purpose, type)
Uploads a file to Stripe from a given URL.
- `url`: URL of the file to upload
- `purpose`: Stripe file purpose (e.g., 'identity_document', 'dispute_evidence')
- `type`: Custom file type identifier

Features:
- Streams file from URL
- Uses octet-stream content type
- Adds custom tfFileType to response
- Supports various Stripe file purposes

### retrieveVendorAccount(id)
Retrieves details of a connected Stripe account.
- `id`: Stripe account ID to retrieve

### fetchDefaultCard(id)
Retrieves a customer's details including their default payment method.
- `id`: Stripe customer ID

Features:
- Returns complete customer object
- Includes default payment method information
- Contains all saved cards and payment methods

### getKycLink(stripeId, HOME_PAGE)
Creates an account onboarding link for KYC verification.
- `stripeId`: Stripe account ID
- `HOME_PAGE`: URL to redirect after completion (falls back to env variable)
- `process.env.HOME_PAGE`: Default redirect URL for KYC completion

Features:
- Creates account onboarding URL
- Configures return and refresh URLs
- Sets collection mode to "eventually_due"
- Supports custom redirect URLs

### getFreshKycLink(stripeId, HOME_PAGE)
Creates a fresh account onboarding link with additional options.
- `stripeId`: Stripe account ID
- `HOME_PAGE`: URL to redirect after completion (falls back to env variable)

Features:
- Creates account onboarding URL with future requirements
- Includes collection options for eventual requirements
- Configurable return and refresh URLs
- More comprehensive than basic getKycLink

### vendorKycOneSpecific(stripeId, remoteAddress)
Updates specific KYC settings for a vendor account.
- `stripeId`: Stripe account ID
- `remoteAddress`: IP address of the vendor
Features:
- Sets manual payout schedule
- Updates account settings
- Returns updated account details

### retrievePayoutsForInfluencers(stripeId)
Retrieves up to 100 payouts for an influencer's connected account.
- `stripeId`: Stripe account ID of the influencer

Features:
- Direct API call using axios
- Uses production key (STRIPE_KEY_PROD)
- Returns list of payouts
- Limit of 100 payouts per request

### retrieveASinglePayoutForInfluencer(stripeId, payoutId)
Retrieves details of a specific payout for an influencer.
- `stripeId`: Stripe account ID of the influencer
- `payoutId`: ID of the specific payout to retrieve

Features:
- Direct API call using axios
- Retrieves detailed payout information
- Uses production key (STRIPE_KEY_PROD)

### updateVendor(stripeId)
Updates a vendor's account settings to use manual payout scheduling.
- `stripeId`: Stripe account ID of the vendor

Features:
- Sets payout schedule to manual mode
- Uses environment-specific Stripe key
- Returns updated account details

### retrievePayouts(vendorId, startingAfter, status)
Retrieves paginated list of payouts for a vendor.
- `vendorId`: Stripe account ID of the vendor
- `startingAfter`: Pagination cursor (optional)
- `status`: Filter by payout status (optional, defaults to null)

Features:
- Supports pagination using `starting_after`
- Optional status filtering (sets to "pending" if status provided)
- Limit of 100 payouts per request
- Uses Stripe SDK for the request

### vendorPayment()
Creates a charge for a vendor's connected account.
- Fixed amount of 1000 cents ($10.00 USD)
- Requires source_id and connected account configuration

Features:
- Creates direct charges
- Uses USD currency
- Processes through connected accounts
- Hardcoded test values (needs customization for production)

### updateAccountType(stripeAccountId, businessType)
Updates a Stripe account's business type.
- `stripeAccountId`: Stripe account ID to update
- `businessType`: New business type value (e.g., 'individual', 'company')

Features:
- Modifies account business classification
- Supports all Stripe business types
- Returns updated account details



## License
ISC

## Author

Ritik Kumar Sahoo