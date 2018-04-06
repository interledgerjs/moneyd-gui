const Koa = require('koa')
const router = require('koa-router')()
const app = new Koa()

const fs = require('fs-extra')
const path = require('path')
const views = require('koa-views')(path.resolve(__dirname, 'views'), {
  extension: 'pug'
})

const fetch = require('node-fetch')
const makePlugin = require('ilp-plugin')

const ADMIN_API_PORT = process.env.ADMIN_API_PORT || 7769

router.get('/', async ctx => {
  await ctx.render('index')
})

router.get('/api/:command', async ctx => {
  const res = await fetch(`http://localhost:${ADMIN_API_PORT}/` + ctx.params.command, {
    method: 'GET',
  })

  const locals = await res.json()
  locals._root = Object.assign({}, locals) // required for rates

  await ctx.render(ctx.params.command, locals)
})

router.get('/index.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile(path.resolve(__dirname, 'src', 'index.js'))
})

app
  .use(views)
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(process.env.PORT || 7770)
