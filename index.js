const Stripe = require("stripe")
const request = require("request")
const axios = require("axios")
require("dotenv").config()

module.exports = {
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

  updateAccount(stripeId, name, address) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.customers.update(stripeId, {
          name,
          address
        })
        resolve(stripeResponse)
      } catch (err) {
        reject(err)
      }
    })
  },

  createVendor(email, country) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.create({
          email,
          country,
          type: "custom",
          requested_capabilities: ["card_payments", "transfers"],
          settings: {
            payouts: {
              schedule: {
                interval: "manual"
              }
            }
          }
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  deleteAccount(stripeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.del(stripeId)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  createAccountToken(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const token = stripe.tokens.create(payload)
        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  },

  addCard(id, token) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.customers.createSource(id, {
          source: token
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  setDefaultCard(stripeCustomerId, stripeCardId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.customers.update(stripeCustomerId, {
          default_source: stripeCardId
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchCard(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const result = await Promise.all([
          await stripe.customers.listSources(id),
          await stripe.customers.retrieve(id)
        ])
        const { data } = result[0]
        const { default_source } = result[1] // eslint-disable-line camelcase
        const stripeResponse = data.map(card => Object.assign(card, {
          isDefault: (card.id === default_source) // eslint-disable-line camelcase
        }))
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  deleteCard(id, cardId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.customers.deleteSource(id, cardId)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  addBankInfo(stripeId, routingNo, accountNo, accountHolderName = null, country, currency = "usd") {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const accountObj = {
          object: "bank_account",
          country,
          currency,
          account_number: accountNo,
          routing_number: routingNo
        }
        if (accountHolderName !== null) {
          accountObj.account_holder_name = accountHolderName
        }

        // eur doesn't have routing number support

        if (currency === "eur" || currency === "nok") delete accountObj.routing_number

        const stripeResponse = await stripe.accounts.createExternalAccount(stripeId, {
          external_account: accountObj
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  addPayoutCard(stripeId, cardid) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())

        const stripeResponse = await stripe.accounts.createExternalAccount(stripeId, {
          external_account: cardid
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  getExternalAccounts(stripeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.listExternalAccounts(stripeId)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  removeExternalAccount(stripeId, accountId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.deleteExternalAccount(stripeId, accountId)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  updateExternalAccountDefault(stripeId, accountId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.updateExternalAccount(
          stripeId,
          accountId,
          { default_for_currency: true }
        )
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  vendorKyc(stripeId, email, phone, address, dob, name, remoteAddress, docs, ssnLastFour = null, personalIdNumber = null, category = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const individual = {
          address,
          dob,
          email,
          phone,
          first_name: name.first,
          last_name: name.last
        }

        if (address.country === "US") {
          if (ssnLastFour !== null) individual.ssn_last_4 = ssnLastFour
          if (personalIdNumber !== null) individual.id_number = personalIdNumber
        }
        if (address.country === "IN") {
          individual.id_number = personalIdNumber
          individual.id_number_type = "PAN"
        }
        if (docs !== undefined) individual.verification = docs
        const kycDetailsObject = {
          business_profile: {
            url: process.env.PRODUCT_WEBSITE_URL,
            mcc: "7299"
          },

          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: remoteAddress // Assumes you're not using a proxy
          },
          settings: {
            payouts: {
              schedule: {
                interval: "manual"
              }
            }
          }
        }
        if (category === "Business") kycDetailsObject.business_type = "company"
        else {
          kycDetailsObject.business_type = "individual"
          kycDetailsObject.individual = individual
        }

        if (address.country === "IN") delete kycDetailsObject.settings
        const stripeResponse = await stripe.accounts.update(stripeId, kycDetailsObject)
        resolve(stripeResponse)
      } catch (error) {
        console.log("vendor KYC error", error)
        reject(error)
      }
    })
  },

  acceptTosOnly(stripeId, remoteAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const kycDetailsObject = {
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: remoteAddress // Assumes you're not using a proxy
          },
          business_type: "individual",
          business_profile: {
            url: process.env.PRODUCT_WEBSITE_URL,
            mcc: "7299"
          }
        }
        const stripeResponse = await stripe.accounts.update(stripeId, kycDetailsObject)
        resolve(stripeResponse)
      } catch (err) {
        reject(err)
      }
    })
  },

  connectAccountCharge(vendorId, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const opts = {
          amount: amountInCents,
          currency: "usd",
          source: vendorId
        }

        const stripeResponse = await stripe.charges.create(opts)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  Payment(customer, vendor, amount, vendorAmount, description = null, currency = "usd", receiptEmail = null, statementDescriptor = null, capture = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const vendorAmountInCents = Number(Number(vendorAmount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const opts = {
          capture,
          customer,
          amount: amountInCents, // convert to cents from dollar
          currency,
          statement_descriptor: `${process.env.PRODUCT_NAME}`,
          description
        }

        if (process.env.DO_SPLIT_PAYMENT === "true") {
          opts.destination = {
            amount: vendorAmountInCents,
            account: vendor,
          }
        }

        if (receiptEmail !== null) opts.receipt_email = receiptEmail
        if (statementDescriptor !== null) opts.statement_descriptor = statementDescriptor
        const stripeResponse = await stripe.charges.create(opts)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  PaymentIndia(customer, vendor, amount, vendorAmount, description = null, currency = "usd", receiptEmail = null, statementDescriptor = null, capture = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const opts = {
          capture,
          customer,
          amount: amountInCents, // convert to cents from dollar
          currency,
          description
        }
        if (receiptEmail !== null) opts.receipt_email = receiptEmail
        if (statementDescriptor !== null) opts.statement_descriptor = statementDescriptor
        const stripeResponse = await stripe.charges.create(opts)
        resolve(stripeResponse)
      } catch (err) {
        reject(err)
      }
    })
  },

  PaymentIntent(customer, vendor, amount, vendorAmount, description) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const vendorAmountInCents = Number(Number(vendorAmount * 100).toFixed(2))

        const opt = {
          amount: amountInCents,
          currency: "usd",
          statement_descriptor: `${process.env.PRODUCT_NAME}`,
          customer,
          description,
          payment_method_options: {
            card: {
              request_three_d_secure: "any"
            }
          }
        }

        if (process.env.DO_SPLIT_PAYMENT === "true") {
          opt.transfer_data = {
            amount: vendorAmountInCents,
            destination: vendor
          }
          opt.on_behalf_of = vendor
        }

        const stripeResponse = await stripe.paymentIntents.create(opt)

        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  PaymentIntentIndia(customer, amount, description) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())

        const stripeResponse = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          statement_descriptor: `${process.env.PRODUCT_NAME}`,
          customer,
          description
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  MultiTransferPayment(customer, amount, transfers, transferGroup, currency = "usd", receiptEmail = null, description = null, statementDescriptor = null, capture = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const opts = {
          capture,
          customer,
          amount: amountInCents, // convert to cents from dollar
          currency,
          description,
          transfer_group: transferGroup
        }
        if (receiptEmail !== null) opts.receipt_email = receiptEmail
        if (statementDescriptor !== null) opts.statement_descriptor = statementDescriptor
        const stripeResponse = await stripe.charges.create(opts)
        // await stripeConnect.initiatePayment({
        //   customer, vendor, amount, vendorAmount, currency, receiptEmail, description, statementDescriptor, capture
        // })

        const transferPromise = []
        transfers.forEach((elem) => {
          const elemAmount = Number(Number(elem.amount * 100).toFixed(2))
          transferPromise.push(
            stripe.transfers.create({
              amount: elemAmount,
              currency,
              destination: elem.stripeId,
              transfer_group: transferGroup
            })
          )
        })
        const transferResponses = await Promise.all(transferPromise)

        const trimmedTransferData = transfers.map((cur, index) => ({ ...cur, id: transferResponses[index].id }))
        resolve({
          charge: stripeResponse,
          transfers: trimmedTransferData
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  payout(vendorId, vendorAmount, currency = "usd", isInstant = false, destination) {
    return new Promise(async (resolve, reject) => {
      try {
        const amount = Number(Number(vendorAmount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.payouts.create({
          amount,
          currency,
          method: isInstant ? "instant" : "standard",
          destination
        }, {
          stripe_account: vendorId,
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  checkBalance(vendorId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.balance.retrieve({ stripe_account: vendorId })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  changeVendorPayoutSetting(vendorId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.update(vendorId, {
          settings: {
            payouts: {
              schedule: {
                interval: "manual"
              }
            }
          }
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  chargeRefund(chargeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.refunds.create({
          charge: chargeId
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },
  transferRefund(transferId, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = stripe.transfers.createReversal(
          transferId,
          { amount: amountInCents }
        )
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  createStripeTransfer(amount, destination, transferGroup, currency = "usd") {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const amountInCents = Number(Number(amount * 100).toFixed(2))
        const stripeResponse = await stripe.transfers.create({
          amount: amountInCents,
          currency,
          destination,
          transfer_group: transferGroup
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  fileUpload(url, purpose, type) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const fp = request(url)

        const stripeResponse = await stripe.files.create({
          purpose,
          file: {
            data: fp,
            type: "application/octet-stream",
          },
        })
        resolve({ ...stripeResponse, tfFileType: type })
      } catch (error) {
        reject(error)
      }
    })
  },
  retrieveVendorAccount(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = await Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accounts.retrieve(id)
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  fetchDefaultCard(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const result = await stripe.customers.retrieve(id)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  },

  getKycLink(stripeId, HOME_PAGE) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accountLinks.create({
          account: stripeId,
          refresh_url: HOME_PAGE !== undefined ? HOME_PAGE : process.env.HOME_PAGE,
          return_url: HOME_PAGE !== undefined ? HOME_PAGE : process.env.HOME_PAGE,
          type: "account_onboarding",
          collect: "eventually_due"
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  getFreshKycLink(stripeId, HOME_PAGE) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const stripeResponse = await stripe.accountLinks.create({
          account: stripeId,
          refresh_url: HOME_PAGE !== undefined ? HOME_PAGE : process.env.HOME_PAGE,
          return_url: HOME_PAGE !== undefined ? HOME_PAGE : process.env.HOME_PAGE,
          type: "account_onboarding",
          collection_options: {
            fields: "eventually_due",
            future_requirements: "include"
          }
        })
        resolve(stripeResponse)
      } catch (error) {
        reject(error)
      }
    })
  },

  vendorKycOneSpecific(stripeId, remoteAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const kycDetailsObject = {
          settings: {
            payouts: {
              schedule: {
                interval: "manual"
              }
            }
          }
        }

        const stripeResponse = await stripe.accounts.update(stripeId, kycDetailsObject)
        resolve(stripeResponse)
      } catch (error) {
        console.log("vendor KYC error", error)
        reject(error)
      }
    })
  },

  retrievePayoutsForInfluencers(stripeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripeResponse = await axios.get("https://api.stripe.com/v1/payouts?limit=100", {
          headers: {
            "Stripe-Account": stripeId,
            Authorization: `Bearer ${process.env.STRIPE_KEY_TF_PROD}`
          }
        })
        resolve(stripeResponse)
      } catch (error) {
        console.log("payout retrieval error", error)
        reject(error)
      }
    })
  },

  retrieveASinglePayoutForInfluencer(stripeId, payoutId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripeResponse = await axios.get(`https://api.stripe.com/v1/payouts/${payoutId}`, {
          headers: {
            "Stripe-Account": stripeId,
            Authorization: `Bearer ${process.env.STRIPE_KEY_TF_PROD}`
          }
        })
        resolve(stripeResponse)
      } catch (error) {
        console.log("payout retrieval error", error)
        reject(error)
      }
    })
  },

  updateVendor(stripeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const updateData = {
          settings: {
            payouts: {
              schedule: {
                interval: "manual"
              }
            }
          }
        }
        const stripeResponse = await stripe.accounts.update(stripeId, updateData)
        resolve(stripeResponse)
      } catch (error) {
        console.log("vendor KYC error", error)
        reject(error)
      }
    })
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

  vendorPayment() {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const response = await stripe.charges.create({
          amount: 1000, // Amount in cents
          currency: "usd",
          source: "source_id", // The vendor's card or bank account
          stripeAccount: "acct_connected_account_id", // Connected account ID
        })
        resolve(response)
      } catch (error) {
        console.log("payout retrieval error", error)
        reject(error)
      }
    })
  },

  updateAccountType(stripeAccountId, businessType) {
    return new Promise(async (resolve, reject) => {
      try {
        const stripe = Stripe(this.getCurrentEnvironment())
        const response = await stripe.accounts.update(
          stripeAccountId,
          {
            business_type: businessType
          }
        )
        resolve(response)
      } catch (error) {
        console.log("updateAccountType error", error)
        reject(error)
      }
    })
  }
}

