window.addEventListener('load', function () {
  let active = window.location.hash.substring(1) || 'routing'
  console.log('active', active)

  window.load_view = async function (view) {
    document.getElementById('main').innerHTML = ''
    // document.getElementById(active).classList.toggle('active')
    // document.getElementById(view).classList.toggle('active')
    active = view
    window.location.hash = active

    const res = await fetch('/api/' + view)
    const html = await res.text()
    document.getElementById('main').innerHTML = html
  }

  window.load_view(active)
})
