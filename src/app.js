const Index = require('./controllers/index')
const Send = require('./controllers/send')
const Ping = require('./controllers/ping')
const Graph = require('./controllers/graph')
const Errors = require('./controllers/errors')
const Receiver = require('./controllers/receiver')
const PubSub = require('./lib/pubsub')
const Pay = require('./controllers/pay')
const Koa = require('koa')
const Router = require('koa-router')
const Parser = require('koa-bodyparser')
const Views = require('koa-views')
const path = require('path')
const Riverpig = require('riverpig')

class App {
  constructor (deps) {
    this.index = deps(Index)
    this.send = deps(Send)
    this.ping = deps(Ping)
    this.errors = deps(Errors)
    this.receiver = deps(Receiver)
    this.pubsub = deps(PubSub)
    this.graph = deps(Graph)
    this.pay = deps(Pay)

    this.logger = Riverpig('moneyd-gui')
    this.router = Router()
    this.parser = Parser()

    this.views = Views(path.resolve(__dirname, '../views'), {
      extension: 'pug'
    })

    this.app = new Koa()
  }

  async listen () {
    await this.errors.init(this.app)

    this.logger.info('creating app')
    const server = this.app
      .use(this.parser)
      .use(this.views)
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .listen(process.env.PORT || 7770, '127.0.0.1')
    this.logger.info('listening on :' + (process.env.PORT || 7770))

    this.logger.info('attaching endpoints and connecting to moneyd...')
    await this.pubsub.init(server)
    await this.index.init(this.router)
    await this.send.init(this.router)
    await this.ping.init(this.router)
    await this.graph.init(this.router)
    await this.receiver.init(this.router)
    await this.pay.init(this.router, this.app)
    this.logger.info('moneyd-gui ready (republic attitude)')
  }
}

module.exports = App
