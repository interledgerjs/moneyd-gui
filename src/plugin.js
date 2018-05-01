const XrpEscrowPlugin = require('ilp-plugin-xrp-escrow')

const plugin = new XrpEscrowPlugin({
  secret: 'snnZw1PPtxCwpK6V1qYW6ZS87sgaH',
  account: 'raZkBcKAkrAxjuDndVcFaeyVnAuxBtAyaf',
  server: 'wss://s.altnet.rippletest.net:51233',
  prefix: 'test.crypto.xrp.'
})

module.exports = plugin
