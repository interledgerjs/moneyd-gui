const { createReceiver } = require('ilp-protocol-psk2')
const makePlugin = require('ilp-plugin')

class Receiver {
  constructor (deps) {
    this.receiver = null
    this.plugin = makePlugin()
    this.packets = []
  }

  getPackets () {
    return this.packets
  }

  generateAddressAndSecret () {
    return this.receiver.generateAddressAndSecret()
  }

  async listen () {
    await this.plugin.connect()
    this.receiver = await createReceiver({
      plugin: this.plugin,
      paymentHandler: async params => {
        this.packets.unshift({
          date: new Date().toISOString(),
          amount: params.prepare.amount,
          id: params.id.toString('hex')
        })
        await new Promise(resolve => setImmediate(resolve))
        return params.accept()
      }
    })

  }
}

module.exports = Receiver
