const makePlugin = require('ilp-plugin')
const crypto = require('crypto')
const IlpPacket = require('ilp-packet')
const ILDCP = require('ilp-protocol-ildcp')
const { Writer } = require('oer-utils')

class Ping {
  constructor (deps) {
    this.conditionMap = new Map()
    this.plugin = makePlugin()
  }

  async init () {
    await this.plugin.connect()

    this.plugin.registerDataHandler(data => {
      const { executionCondition } = IlpPacket.deserializeIlpPrepare(data)

      const fulfillment = this.conditionMap.get(executionCondition.toString('base64'))
      if (fulfillment) {
        this.conditionMap.delete(executionCondition.toString('base64'))
        return IlpPacket.serializeIlpFulfill({
          fulfillment: fulfillment,
          data: Buffer.alloc(0)
        })
      } else {
        throw new Error('unexpected packet.')
      }
    })
  }

  async ping (destination) {
    const fulfillment = crypto.randomBytes(32)
    const condition = crypto.createHash('sha256').update(fulfillment).digest()
    const { clientAddress } = await ILDCP.fetch(this.plugin.sendData.bind(this.plugin))

    this.conditionMap.set(condition.toString('base64'), fulfillment)

    const writer = new Writer()

    writer.write(Buffer.from('ECHOECHOECHOECHO', 'ascii'))
    writer.writeUInt8(0)
    writer.writeVarOctetString(Buffer.from(clientAddress, 'ascii'))

    const result = await this.plugin.sendData(IlpPacket.serializeIlpPrepare({
      destination,
      amount: '100',
      executionCondition: condition,
      expiresAt: new Date(Date.now() + 30000),
      data: writer.getBuffer()
    }))

    const parsedPacket = IlpPacket.deserializeIlpPacket(result)
    if (parsedPacket.type !== IlpPacket.Type.TYPE_ILP_FULFILL) {
      throw new Error('Error sending ping. code=' + parsedPacket.data.code +
        ' message=' + parsedPacket.data.message + ' triggeredBy=' + parsedPacket.data.triggeredBy)
    }
  }
}

module.exports = Ping
