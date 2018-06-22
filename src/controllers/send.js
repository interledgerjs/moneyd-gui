const fs = require('fs-extra')
const path = require('path')
const makePlugin = require('ilp-plugin')
const plugin = makePlugin()
const ILDCP = require('ilp-protocol-ildcp')
const SPSP = require('ilp-protocol-spsp')

class SendController {
  async init (router) {
    await plugin.connect()

    router.post('/actions/send/query', async ctx => {
      const { receiver } = ctx.request.body
      let query
      try {
        query = await SPSP.query(receiver)
      } catch (e) {
        ctx.status = 400
        ctx.body = e.stack
        return
      }

      query.sharedSecret = query.sharedSecret.toString('base64')
      ctx.body = query
    })

    router.post('/actions/send/currency', async ctx => {
      await plugin.connect()
      try {
        ctx.body = await ILDCP.fetch(plugin.sendData.bind(plugin))
      } catch (e) {
        ctx.status = 400
        ctx.body = e.stack
      }
    })

    router.post('/actions/send', async ctx => {
      const { receiver, amount } = ctx.request.body

      try {
        await SPSP.pay(plugin, {
          receiver,
          sourceAmount: amount
        })
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

module.exports = SendController
