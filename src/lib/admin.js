const fetch = require('node-fetch')
const ADMIN_API_PORT = process.env.ADMIN_API_PORT || 7769
const ADMIN_URI = 'http://localhost:' + ADMIN_API_PORT + '/'
const ADMIN_COMMANDS = {
  status: true,
  routing: true,
  accounts: true,
  balance: true,
  rates: true,
  stats: true
}

class Admin {
  static get ADMIN_COMMANDS () {
    return ADMIN_COMMANDS
  }

  constructor (deps) {
  }

  async query (command) {
    const res = await fetch(ADMIN_URI + command, {
      method: 'GET',
    })

    return res.json()
  }
}

module.exports = Admin
