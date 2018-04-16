window.addEventListener('load', function () {
  let active = window.location.hash.substring(1) || 'status'
  console.log('active', active)

  window.load_view = async function (view) {
    document.getElementById('main').innerHTML = ''
    // document.getElementById(active).classList.toggle('active')
    // document.getElementById(view).classList.toggle('active')
    active = view
    window.location.hash = active

    const res = await fetch('/api/' + view)
    const html = await res.text()
    main.innerHTML = html

    const scripts = main.getElementsByTagName('script')
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

  window.reload_view = function () {
    return load_view(window.location.hash.substring(1) || 'status')
  }

  window.load_network = async function () {
    const network = document.getElementById('network')
    const res = await fetch('/actions/index/my_address')
    const json = await res.json()

    let tag = 'Private'
    let color = 'secondary'

    if (json.address.startsWith('g.')) {
      tag = 'Livenet'
      color = 'info'
    }

    if (json.address.startsWith('test.')) {
      tag = 'Testnet'
      color = 'success'
    }

    const badge = document.createElement('span')
    badge.className = 'badge p-1 align-self-center badge-' + color
    badge.innerHTML = tag

    network.appendChild(badge)
  }

  window.load_network()
  window.load_view(active)
})
