const plugin = require('ilp-plugin')()
const SPSP = require('ilp-protocol-spsp')
const mount = require('koa-mount')
const serve = require('koa-static')
const path = require('path')

class WalletConfigController {
  async init (router, app) {
    app.use(mount('/pay', serve(path.resolve(__dirname, '../../static/pay'))))
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
