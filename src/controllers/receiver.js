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

    router.get('/pay', async ctx => {
      const { destinationAccount, sharedSecret } = this.receiver.generateAddressAndSecret()
      ctx.body = {
        destination_account: destinationAccount,
        shared_secret: sharedSecret.toString('base64'),
        receiver_info: {
          name: 'Moneyd GUI'
        }
      }
      ctx.set('content-type', 'application/spsp4+json')
    })
  }
}

module.exports = ReceiverController
