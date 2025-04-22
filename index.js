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

  addBankInfo(
    stripeId,
    routingNo,
    accountNo,
    accountHolderName = null,
    country = "US"
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const accountObj = {
          object: "bank_account",
          country,
          currency: "usd",
          account_number: accountNo,
          routing_number: routingNo,
        };
        if (accountHolderName !== null) {
          accountObj.account_holder_name = accountHolderName;
        }

        const stripeResponse = await stripe.accounts.update(stripeId, {
          external_account: accountObj,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  fetchCard(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const result = await Promise.all([
          await stripe.customers.listSources(id),
          await stripe.customers.retrieve(id),
        ]);
        const { data } = result[0];
        const { default_source } = result[1]; // eslint-disable-line camelcase
        const stripeResponse = data.map((card) =>
          Object.assign(card, {
            isDefault: card.id === default_source, // eslint-disable-line camelcase
          })
        );
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  addCard(id, token) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.customers.createSource(id, {
          source: token,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  setDefaultCard(stripeCustomerId, stripeCardId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.customers.update(stripeCustomerId, {
          default_source: stripeCardId,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  createStripeTransfer(amount, destination, transferGroup, currency = "usd") {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const amountInCents = Number(Number(amount * 100).toFixed(2));
        const stripeResponse = await stripe.transfers.create({
          amount: amountInCents,
          currency,
          destination,
          transfer_group: transferGroup,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  chargeRefund(chargeId, reason = "") {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.refunds.create({
          charge: chargeId,
          reason,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCard(id, cardId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.customers.deleteSource(id, cardId);
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteVendorAccount(vendorId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.accounts.del(vendorId);
        console.log({ stripeResponse });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  getExternalAccounts(stripeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());

        const stripeResponse = await stripe.accounts.listExternalAccounts(
          stripeId
        );

        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  retrieveVendorAccount(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = await Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.accounts.retrieve(id);
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  checkBalance(vendorId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.balance.retrieve({
          stripeAccount: vendorId,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

 retrievePayouts(vendorId, startingAfter, status = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())

        const query = {
          limit: 100
        }
        if (status !== null) {
          query.status = "pending"
        }
        if (startingAfter !== null) {
          query.starting_after = startingAfter
        }
        const response = await stripe.payouts.list(query, { stripeAccount: vendorId })
        // console.log(startingAfter, response, response.has_more)
        // payouts = payouts.concat(response.data)

        resolve(response)
      } catch (error) {
        console.log("payout retrieval error", error)
        reject(error)
      }
    })
  },

  transferRefund(transferId, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2));
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = stripe.transfers.createReversal(transferId, {
          amount: amountInCents,
        });
        resolve(stripeResponse);
      } catch (error) {
        reject(error);
      }
    });
  },

  payout(vendorId, vendorAmount, currency = "usd") {
    return new Promise(async (resolve, reject) => {
      try {
        const amount = Number(Number(vendorAmount * 100).toFixed(2));
        const stripe = Stripe(this.getCurrentEnvironment());
        const stripeResponse = await stripe.payouts.create(
          {
            amount,
            currency,
          },
          {
            stripeAccount: vendorId,
          }
        );
        resolve(stripeResponse);
      } catch (error) {
        // console.log(err)
        reject(error);
      }
    });
  },

  async verifyAccount(customerId, bankAccountId, amount) {
    try {
      const stripe = Stripe(this.getCurrentEnvironment());
      return await stripe.customers.verifySource(customerId, bankAccountId, {
        amounts: [amount.amount1, amount.amount2],
      });
    } catch (err) {
      throw err;
    }
  },

  async achPayment(vendorId, customerId, amount, currency = "usd") {
    try {
      const stripe = Stripe(this.getCurrentEnvironment());
      const amountInCents = Number(Number(amount * 100).toFixed(2));
      return await stripe.charges.create({
        amount: amountInCents,
        currency,
        customer: vendorId,
        transfer_data: {
          amount: amountInCents,
          destination: customerId,
        },
      });
    } catch (err) {
      throw err;
    }
  },
}

module.exports = stripeService
