;(function () {
  const packetsTable = document.getElementById('packets')

  async function loadPackets () {
    const res = await fetch('/actions/receive/packets')
    const json = await res.json()

    console.log(json)

    if (json.length) {
      packetsTable.innerHTML = ''
    }

    for (const packet of json) {
      const row = document.createElement('tr')
      const date = document.createElement('td')
      const id = document.createElement('td')
      const amount = document.createElement('td')

      date.innerHTML = packet.date
      id.innerHTML = packet.id
      amount.innerHTML = packet.amount

      row.appendChild(date)
      row.appendChild(id)
      row.appendChild(amount)
      packetsTable.appendChild(row)      
    }
  }

  loadPackets()
})()
