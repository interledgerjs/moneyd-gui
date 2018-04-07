const Index = require('./controllers/index')
const Send = require('./controllers/send')
const Errors = require('./controllers/errors')
const Koa = require('koa')
const Router = require('koa-router')
const Parser = require('koa-bodyparser')
const Views = require('koa-views')
const path = require('path')

class App {
  constructor (deps) {
    this.index = deps(Index)
    this.send = deps(Send)
    this.errors = deps(Errors)

    this.router = Router()
    this.parser = Parser()

    this.views = Views(path.resolve(__dirname, '../views'), {
      extension: 'pug'
    })

    this.app = new Koa()
  }

  async listen () {
    await this.errors.init(this.app)

    this.app
      .use(this.parser)
      .use(this.views)
      .use(this.router.routes())
      .use(this.router.allowedMethods())
      .listen(process.env.PORT || 7770)

    await this.index.init(this.router)
    await this.send.init(this.router)
  }
}

module.exports = App
