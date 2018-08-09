const fetch = require('node-fetch')
const ADMIN_API_PORT = process.env.ADMIN_API_PORT || 7769
const ADMIN_URI = 'http://localhost:' + ADMIN_API_PORT
const ADMIN_COMMANDS = {
  status: true,
  routing: true,
  accounts: true,
  balance: true,
  rates: true,
  stats: true,
  alerts: true
}

class Admin {
  static get ADMIN_COMMANDS () {
    return ADMIN_COMMANDS
  }

  constructor (deps) {
  }

  async query (command) {
    const res = await fetch(ADMIN_URI + '/' + command, {
      method: 'GET',
    })

    if (!res.ok) {
      throw new Error(await res.text())
    }

    return res.json()
  }

  async sendAccountAdminInfo (account, info) {
    const res = await fetch(ADMIN_URI + '/accounts/' + account, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    })

    return res.json()
  }

  modifyBalance (balanceUpdate) {
    return fetch(ADMIN_URI + '/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceUpdate)
    })
  }

  deleteAlert (alertId) {
    return fetch(ADMIN_URI + '/alerts/' + encodeURIComponent(alertId), {
      method: 'DELETE'
    })
  }
}

module.exports = Admin
