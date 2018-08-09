;(function () {
  const accountIdEl = document.getElementById('plugin-admin-account')
  const resultEl = document.getElementById('plugin-admin-info')

  function escapeHTML (text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function setResultError (stack) {
    resultEl.innerHTML = stack
  }

  function setResultMessage (msg) {
    resultEl.innerHTML = msg

    const scripts = resultEl.getElementsByTagName('script')
    console.log(scripts)

    for (const script of scripts) {
      const newScript = document.createElement('script')
      newScript.src = script.src
      newScript.innerHTML = script.innerHTML
      console.log(newScript)
      setTimeout(() => {
        script.parentNode.appendChild(newScript)
        script.parentNode.removeChild(script)
      })
    }
  }

  function getAccountAdminInfo (account) {
    console.log(account)
    return fetch('/api/plugin_admin/' + account)
  }

  async function setAccount () {
    try {
      const res = await getAccountAdminInfo(accountIdEl.value)
      if (res.ok) {
        setResultMessage(await res.text())
      } else {
        setResultError(await res.text())
      }
    } catch (e) {
      setResultError(e.stack)
    }
  }

  setAccount()
  accountIdEl.addEventListener('change', function (event) {
    setAccount()
  })
})()
