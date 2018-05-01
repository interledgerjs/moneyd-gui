#!/usr/bin/env node
'use strict'

const reduct = require('reduct')
const App = require('./src/app')
const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')
const IlpPacket = require('ilp-packet')

const plugin = new XrpEscrowPlugin({
  secret: 'snnZw1PPtxCwpK6V1qYW6ZS87sgaH',
  account: 'raZkBcKAkrAxjuDndVcFaeyVnAuxBtAyaf',
  server: 'wss://s.altnet.rippletest.net:51233',
  prefix: 'test.crypto.xrp.'
})

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
