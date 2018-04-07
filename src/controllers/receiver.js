const Receiver = require('../lib/receiver')
const fs = require('fs-extra')
const path = require('path')

class ReceiverController {
  constructor (deps) {
    this.receiver = deps(Receiver)
  }

  async init (router) {
    await this.receiver.listen()

    router.get('/actions/receive/packets', async ctx => {
      ctx.body = this.receiver.getPackets()
    })

    router.get('/receive.js', async ctx => {
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/receive.js'))
    })

    router.get('/pay', async ctx => {
      const { destinationAccount, sharedSecret } = this.receiver.generateAddressAndSecret()
      ctx.body = {
        destination_account: destinationAccount,
        shared_secret: sharedSecret.toString('base64'),
        receiver_info: {
          name: 'Moneyd GUI'
        }
      }
    })
  }
}

module.exports = ReceiverController
