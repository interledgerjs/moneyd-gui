const { Server } = require('ilp-protocol-stream')
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

    this.receiver = new Server({
      plugin: this.plugin
    })

    this.receiver.on('connection', conn => {
      conn.on('stream', stream => {
        stream.setReceiveMax(2 ** 55)
        stream.on('money', amount => {
          const packet = {
            date: new Date().toISOString(),
            amount
          }

          this.packets.unshift(packet)
          this.pubsub.publish('receive:packet', packet)
        })
      })
    })

    await this.receiver.listen()
  }
}

module.exports = Receiver
