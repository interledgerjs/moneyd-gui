const Ping = require('../lib/ping')
const fs = require('fs-extra')
const path = require('path')

class PingController {
  constructor (deps) {
    this.ping = deps(Ping)
  }

  async init (router) {
    await this.ping.init()

    router.post('/actions/ping', async ctx => {
      const { destination } = ctx.request.body

      try {
        // TODO: use actual ping code
        await this.ping.ping(destination)
      } catch (e) {
        ctx.status = 400
        ctx.body = {
          success: false,
          message: e.message,
          stack: e.stack
        }
        return
      }

      ctx.body = { success: true }
    })
  }
}

module.exports = PingController
