const { createReceiver } = require('ilp-protocol-psk2')
const makePlugin = require('ilp-plugin')
const PubSub = require('./pubsub')

class Receiver {
  constructor (deps) {
    this.pubsub = deps(PubSub)

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
        const packet = {
          date: new Date().toISOString(),
          amount: params.prepare.amount,
          id: params.id.toString('hex')
        }

        this.packets.unshift(packet)
        this.pubsub.publish('receive:packet', packet)

        await new Promise(resolve => setImmediate(resolve))
        return params.accept()
      }
    })

  }
}

module.exports = Receiver
