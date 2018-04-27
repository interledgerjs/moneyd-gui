const fs = require('fs-extra')
const path = require('path')

class WalletConfigController {
  constructor (opts) {

  }

  async init (router) {
    router.get('/walletConfig.js', async ctx => {
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/walletConfig.js'))
    })
  }
}

module.exports = WalletConfigController
