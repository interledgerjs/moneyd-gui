const fs = require('fs-extra')
const path = require('path')

class WalletConfigController {
  async init (router) {
    // router.get('/pay/walletConfig.js', async ctx => {
    //   ctx.set('Content-Type', 'text/javascript')
    //   ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/pay/walletConfig.js'))
    // })
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
