;(function () {
  const destination = document.getElementById('destination')
  const destinationForm = document.getElementById('destination-form')
  const destinationDetails = document.getElementById('destination-details')
  const ping = document.getElementById('ping')

  function setPingingInfo () {
    ping.onclick = function () {}
    ping.className = 'btn btn-secondary btn-lg btn-block'
    ping.innerHTML = 'Pinging...'
  }

  function setPingingSuccess () {
    ping.onclick = sendPing
    ping.className = 'btn btn-success btn-lg btn-block'
    ping.innerHTML = 'Success'
  }

  function setPingingFailure () {
    ping.onclick = sendPing
    ping.className = 'btn btn-danger btn-lg btn-block'
    ping.innerHTML = 'Failed'
  }

  function setStatusCard (html) {
    const card = document.createElement('div')
    const cardBody = document.createElement('div')

    card.className = 'card'
    cardBody.className = 'card-body'

    cardBody.innerHTML = html
    destinationDetails.innerHTML = ''

    card.appendChild(cardBody)
    destinationDetails.appendChild(card)
  }

  function resetStatusCard () {
    destinationDetails.innerHTML = ''
  }

  function resetPing () {
    ping.className = 'btn btn-primary btn-lg btn-block'
    ping.innerHTML = 'Ping'
  }

  let pingResetTimeout = null
  window.sendPing = async function sendPing (e) {
    e.preventDefault()
    console.log('preparing to ping')
    setPingingInfo()

    try {
      const res = await fetch('/actions/ping', {
        method: 'POST',
        body: JSON.stringify({
          destination: destination.value
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()

      if (json.success) {
        setPingingSuccess()
        resetStatusCard()
      } else {
        setPingingFailure()
        setStatusCard(`
          <h4 class="text-danger">Ping Error</h4>
          <pre style="white-space: pre-wrap;"><code class="text-danger">${ json.stack }</code></pre>
        `)
      }
    } catch (e) {
      setPingingFailure()
      setStatusCard(`
        <h4 class="text-danger">Ping Error</h4>
        <pre style="white-space: pre-wrap;"><code class="text-danger">${ e.stack }</code></pre>
      `)
    }

    clearTimeout(pingResetTimeout)
    pingResetTimeout = setTimeout(function () {
      resetPing()
    }, 2000)
  }
})()
