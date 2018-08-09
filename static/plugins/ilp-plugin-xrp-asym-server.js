;(function () {
  const accountIdEl = document.getElementById('plugin-admin-account')
  const settleAmountEl = document.getElementById('settle-amount')
  const settleButtons = document.querySelectorAll('button[id^=\'settle:\']')
  const blockButtons = document.querySelectorAll('button[id^=\'block:\']')

  function accountAction (body) {
    return fetch('/api/plugin_admin/' + accountIdEl.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  settleButtons.forEach(button => {
    button.addEventListener('click', async event => {
      event.preventDefault()
      button.disabled = true
      const account = event.target.id.split(':')[1]

      try {
        const res = await accountAction({
          command: 'settle',
          amount: settleAmountEl.value,
          account
        })
        if (res.ok) {
          button.classList.remove('btn-secondary')
          button.classList.add('btn-success')
          button.innerText = 'Success'
        } else {
          throw Error()
        }
      } catch (e) {
        button.classList.remove('btn-secondary')
        button.classList.add('btn-danger')
        button.innerText = 'Failed'
      }
      setTimeout(() => {
        button.disabled = false
        button.classList.remove('btn-danger')
        button.classList.remove('btn-success')
        button.classList.add('btn-secondary')
        button.innerText = 'Settle'
      }, 2000)
    })
  })

  blockButtons.forEach(button => {
    button.addEventListener('click', async event => {
      event.preventDefault()
      button.disabled = true
      const account = event.target.id.split(':')[1]

      try {
        const res = await accountAction({
          command: 'block',
          account
        })
        if (res.ok) {
          button.innerText = 'Blocked'
        } else {
          throw Error()
        }
      } catch (e) {
        button.classList.remove('btn-danger')
        button.classList.add('btn-secondary')
        button.innerText = 'Failed'
      }
      setTimeout(() => {
        button.disabled = false
        button.classList.remove('btn-secondary')
        button.classList.add('btn-danger')
        button.innerText = 'Block'
      }, 2000)
    })
  })
})()
