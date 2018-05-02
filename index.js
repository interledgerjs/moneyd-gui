#!/usr/bin/env node
'use strict'

const reduct = require('reduct')
const App = require('./src/app')
const plugin = require('./src/plugin')

if (require.main === module) {
  const app = reduct()(App)
  plugin.connect().then(function () {
    console.log('Connected to plugin!')

    app.listen()
  })
} else {
  module.exports = {
    App
  }
}
