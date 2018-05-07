const plugin = require('../plugin')
const SPSP = require('ilp-protocol-spsp')

class WalletConfigController {
  async init (router) {
    router.post('/pay/send-webpayment', async (ctx, next) => {
      const data = ctx.request.body
      await SPSP.pay(plugin, {
        receiver: data.paymentPointer,
        sourceAmount: data.amount
      })

      ctx.body = {
        paymentRequestId: data.paymentRequestId,
        success: true
      }
    })
  }
}

module.exports = WalletConfigController
