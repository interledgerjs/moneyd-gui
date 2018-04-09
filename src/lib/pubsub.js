const debug = require('debug')('moneyd-gui:pubsub')
const WebSocket = require('ws')

class PubSub {
  constructor (deps) {
    this.subscriptions = new Map()
  }

  async init (server) {
    this.wss = new WebSocket.Server({ server })
    this.wss.on('connection', ws => {
      ws.on('error', debug.bind(null))
      ws.on('message', msg => {
        try {
          const parsed = JSON.parse(msg)
          debug('subscribing channel. channel=', parsed.channel)
          this.subscribe(ws, parsed.channel)
        } catch (e) {
          debug('error handling message. error=', e)
        }
      })
    })
  }

  async publish (channel, message) {
    const sockets = this.subscriptions.get(channel) || []

    // iterate sockets and send message, or destroy subscription if error occurs
    await Promise.all(sockets.map(async (ws, index) => {
      try {
        await new Promise(resolve => {
          ws.send(JSON.stringify({ channel, message }), resolve)
        })
      } catch (e) {
        // mark this index for destruction
        debug(e)
        sockets[index] = null
      }
    }))

    // sweep over sockets to clean up
    this.subscriptions.set(channel, sockets.filter(ws => ws))
  }

  subscribe (ws, channel) {
    const existing = this.subscriptions.get(channel)
    if (existing) {
      existing.push(ws)
    } else {
      this.subscriptions.set(channel, [ ws ])
    }
  }
}

module.exports = PubSub
