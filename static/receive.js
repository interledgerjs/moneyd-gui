;(function () {
  const packetsTable = document.getElementById('packets')

  let cleared = false
  function clearPlaceHolder () {
    if (!cleared) packetsTable.innerHTML = ''
    cleared = true
  }

  function createRow (packet) {
    const row = document.createElement('tr')
    const date = document.createElement('td')
    const amount = document.createElement('td')

    date.innerHTML = packet.date
    amount.innerHTML = packet.amount

    row.appendChild(date)
    row.appendChild(amount)
    return row
  }

  async function loadPackets () {
    const res = await fetch('/actions/receive/packets')
    const json = await res.json()

    console.log(json)

    if (json.length) {
      clearPlaceHolder()
    }

    for (const packet of json) {
      packetsTable.appendChild(createRow(packet))
    }
  }

  async function subscribePackets () {
    const socket = new WebSocket('ws://' + window.location.host)

    socket.onopen = function () {
      console.log('open socket')
      socket.send(JSON.stringify({ channel: 'receive:packet' }))
      console.log('sent subscribe')
    }

    socket.onmessage = function (msg) {
      console.log('got message', msg)
      const parsed = JSON.parse(msg.data)
      if (parsed.channel === 'receive:packet') {
        clearPlaceHolder()
        packetsTable.prepend(createRow(parsed.message))
      }
    }
  }

  loadPackets()
  subscribePackets()
})()
