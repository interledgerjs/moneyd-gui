const Koa = require('koa')
const router = require('koa-router')()
const parser = require('koa-bodyparser')()
const app = new Koa()

const fs = require('fs-extra')
const path = require('path')
const views = require('koa-views')(path.resolve(__dirname, 'views'), {
  extension: 'pug'
})

const fetch = require('node-fetch')
const makePlugin = require('ilp-plugin')
const plugin = makePlugin()
const ILDCP = require('ilp-protocol-ildcp')
const SPSP = require('ilp-protocol-spsp')

const ADMIN_API_PORT = process.env.ADMIN_API_PORT || 7769
const ADMIN_COMMANDS = {
  status: true,
  routing: true,
  accounts: true,
  balance: true,
  rates: true,
  stats: true
}

router.get('/', async ctx => {
  await ctx.render('index')
})

router.post('/actions/send/query', async ctx => {
  const { receiver } = ctx.request.body
  const query = await SPSP.query(receiver)
  query.sharedSecret = query.sharedSecret.toString('base64')
  ctx.body = query
})

router.post('/actions/send/currency', async ctx => {
  await plugin.connect()
  ctx.body = await ILDCP.fetch(plugin.sendData.bind(plugin))
})

router.post('/actions/send', async ctx => {
  const { receiver, amount } = ctx.request.body

  try {
    await SPSP.pay(plugin, {
      receiver,
      sourceAmount: amount
    })
  } catch (e) {
    ctx.body = {
      success: false,
      message: e.message,
      stack: e.stack
    }
    return
  }

  ctx.body = { success: true }
})

router.get('/api/:command', async ctx => {
  locals = {}

  if (ctx.params.command in ADMIN_COMMANDS) {
    const res = await fetch(`http://localhost:${ADMIN_API_PORT}/` + ctx.params.command, {
      method: 'GET',
    })

    locals = await res.json()
    locals._root = Object.assign({}, locals) // required for rates
  }

  await ctx.render(ctx.params.command, locals)
})

router.get('/index.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile(path.resolve(__dirname, 'src', 'index.js'))
})

router.get('/send.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile(path.resolve(__dirname, 'src', 'send.js'))
})

app
  .use(parser)
  .use(views)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(process.env.PORT || 7770)
