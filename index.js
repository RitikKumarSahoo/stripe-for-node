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
  }
}

module.exports = stripeService
