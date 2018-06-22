;(function () {
  const accountIdEl = document.getElementById('modify-balance-accountId')
  const amountDiffEl = document.getElementById('modify-balance-amountDiff')
  const submitEl = document.getElementById('modify-balance-submit')
  const resultEl = document.getElementById('modify-balance-result')

  function escapeHTML (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function setResult (html) {
    resultEl.className = ''
    resultEl.innerHTML
      = '<div class="card">'
      +   '<div class="card-body">'
      +     html
      +   '</div>'
      + '</div>'
  }

  function setResultError (stack) {
    setResult
      ( '<h4 class="text-danger">Error</h4>'
      + '<pre style="overflow-x: hidden"><code class="text-danger">'
      +   escapeHTML(stack)
      + '</code></pre>' )
  }

  function setResultMessage (msg) {
    setResult('<h4>' + escapeHTML(msg) + '</h4>')
  }

  function postModifyBalance (balanceUpdate) {
    return fetch('/api/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceUpdate)
    })
  }

  submitEl.addEventListener('click', function (event) {
    event.preventDefault()
    postModifyBalance({
      accountId: accountIdEl.value,
      amountDiff: amountDiffEl.value
    }).then(async function (res) {
      if (res.ok) {
        setResultMessage('Success')
      } else {
        setResultError(await res.text())
      }
    }).catch(function (err) {
      setResultError(err.stack)
    })
  })
})()
