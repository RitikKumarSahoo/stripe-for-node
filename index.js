const Stripe = require("stripe")
require("dotenv").config()

const stripeService = {
  getCurrentEnvironment() {
    if (process.env.NODE_ENV === "production") {
      return process.env.STRIPE_KEY_PROD
    }
    return process.env.STRIPE_KEY_TEST
  },

  createAccount(email) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.customers.create({ email })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  createVendor(email, country = "US") {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.accounts.create({
          email,
          country,
          type: "custom",
          requested_capabilities: ["card_payments", "transfers"],
          settings: {
            payouts: {
              schedule: {
                interval: "manual",
              },
            },
          },
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateExternalAccountDefault(stripeId, accountId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.accounts.updateExternalAccount(
          stripeId,
          accountId,
          { default_for_currency: true }
        );
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  
  

}

module.exports = stripeService
