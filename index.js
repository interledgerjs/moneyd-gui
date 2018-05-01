#!/usr/bin/env node
'use strict'

const reduct = require('reduct')
const App = require('./src/app')
const plugin = require('./src/plugin')

if (require.main === module) {
  const app = reduct()(App)
  plugin.connect().then(function () {
    const ledgerInfo = plugin.getInfo()
    const account = plugin.getAccount()
    console.log(`Connected to ledger: ${ledgerInfo.prefix}`)
    console.log(` - Account: ${account}`)
    console.log(` - Currency: ${ledgerInfo.currencyCode}`)
    console.log(` - CurrencyScale: ${ledgerInfo.currencyScale}`)

    app.listen()
  })
} else {
  module.exports = {
    App
  }
}
