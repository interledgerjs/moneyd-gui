const Admin = require('../lib/admin')
const fs = require('fs-extra')
const path = require('path')

class IndexController {
  constructor (deps) {
    this.admin = deps(Admin)
  }

  async init (router) {
    router.get('/', async ctx => {
      await ctx.render('index')
    })

    router.get('/actions/index/my_address', async ctx => {
      const { address } = await this.admin.query('accounts')
      ctx.body = { address } 
    })

    router.get('/api/:command', async ctx => {
      let locals = {}
      if (ctx.params.command in Admin.ADMIN_COMMANDS) {
        locals = await this.admin.query(ctx.params.command)
      }

      await ctx.render(ctx.params.command, locals)
    })

    router.get('/index.js', async ctx => {
      ctx.set('Content-Type', 'text/javascript')
      ctx.body = await fs.readFile(path.resolve(__dirname, '../../static/index.js'))
    })
  }
}

module.exports = IndexController
