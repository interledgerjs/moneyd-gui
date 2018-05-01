const fs = require('fs-extra')
const path = require('path')
const plugin = require('ilp-plugin')()
const SPSP = require('ilp-protocol-spsp')

function base64url (buf) {
  return buf.toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

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
    // router.get('/pay/sw-interledgerpay.js', async ctx => {
    //   ctx.set('Content-Type', 'text/javascript')
    //   ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/pay/sw-interledgerpay.js'))
    // })
    //
    // router.get('/pay/manifest.json', async ctx => {
    //   ctx.set('Content-Type', 'application/json')
    //   ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/pay/manifest.json'))
    // })
  }
}

module.exports = WalletConfigController
