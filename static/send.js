;(function () {
  const receiver = document.getElementById('receiver')
  const receiverForm = document.getElementById('receiver-form')
  const receiverDetails = document.getElementById('receiver-details')
  const amount = document.getElementById('amount')
  const send = document.getElementById('send')
  const currency = document.getElementById('currency')

  async function loadCurrencyDetails () {
    const res = await fetch('/actions/send/currency', {
      method: 'POST'
    })

    const json = await res.json()
    const prefixes = [ '', 'd', 'c', 'm', null, null, '&mu;', null, null, 'n' ]
    const prefix = prefixes[json.assetScale]

    const code = '(' + (prefix || '') + json.assetCode +
      ((prefix || !json.assetScale) ? '' : ('e-' + json.assetCode)) + ')'

    currency.innerHTML = code
  }

  loadCurrencyDetails()

  function setSendingInfo () {
    send.onclick = function () {}
    send.className = 'btn btn-secondary btn-lg btn-block'
    send.innerHTML = 'Sending...'
  }

  function setSendingSuccess () {
    send.onclick = sendPayment
    send.className = 'btn btn-success btn-lg btn-block'
    send.innerHTML = 'Success'
  }

  function setSendingFailure () {
    send.onclick = sendPayment
    send.className = 'btn btn-danger btn-lg btn-block'
    send.innerHTML = 'Failed'
  }

  function resetSending () {
    send.className = 'btn btn-primary btn-lg btn-block'
    send.innerHTML = 'Send'
  }

  function setStatusCard (html) {
    const card = document.createElement('div')
    const cardBody = document.createElement('div')

    card.className = 'card'
    cardBody.className = 'card-body'

    cardBody.innerHTML = html
    receiverDetails.innerHTML = ''

    card.appendChild(cardBody)
    receiverDetails.appendChild(card)
  }

  let sendingResetTimeout = null
  window.sendPayment = async function sendPayment (e) {
    e.preventDefault()
    console.log('preparing to send')
    setSendingInfo()

    try {
      const res = await fetch('/actions/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver: receiver.value,
          amount: amount.value
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()

      if (json.success) {
        setSendingSuccess()
      } else {
        setSendingFailure()
        setStatusCard(`
          <h4 class="text-danger">Sending Error</h4>
          <pre style="overflow-x: hidden"><code class="text-danger">${ json.stack }</code></pre>
        `)
      }
    } catch (e) {
      setSendingFailure()
    }

    clearTimeout(sendingResetTimeout)
    sendingResetTimeout = setTimeout(function () {
      resetSending()
    }, 2000)
  }

  receiver.addEventListener('focusout', async function () {
    console.log('loading receiver info. receiver=', receiver.value)

    const res = await fetch('/actions/send/query', {
      method: 'POST',
      body: JSON.stringify({ receiver: receiver.value }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.status !== 200) {
      setStatusCard(`
        <h4 class="text-danger">Error</h4>
        <pre style="overflow-x: hidden"><code class="text-danger">${ await res.text() }</code></pre>
      `)
      return
    }

    const json = JSON.stringify(await res.json(), null, 2)
    setStatusCard(`
      <h4>Raw Query Response</h4>
      <pre style="overflow-x: hidden"><code>${json}</code></pre>
    `)
  })
})()
