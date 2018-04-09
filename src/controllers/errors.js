class ErrorsController {
  constructor (deps) {
  }

  async init (app) {
    app.use(async (ctx, next) => {
      try {
        await next()
        if (ctx.status === 404) {
          await ctx.render('404')
          ctx.status = 404
        }
      } catch (error) {
        if (error.code == 400) {
          throw error
        }
        if (error.code === 'ENOENT') {
          await ctx.render('404', { url: ctx.url })
          ctx.status = 404
          return
        }
        await ctx.render('500', { error, port: (process.env.ADMIN_API_PORT || 7769) })
        ctx.status = 500
      }
    })
  }
}

module.exports = ErrorsController
