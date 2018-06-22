;(function () {
  const rowsEl = document.getElementById('alert-rows')

  function getAlertRow (id) {
    for (let i = 0; i < rowsEl.children.length; i++) {
      const rowEl = rowsEl.children[i]
      if (rowEl.dataset.alertId === id) return rowEl
    }
    return null
  }

  async function deleteAlert (id) {
    const res = await fetch('/api/alerts/' + encodeURIComponent(id), {
      method: 'DELETE'
    })
    if (res.ok) {
      const rowEl = getAlertRow(id)
      if (rowEl) rowEl.remove()
    }
  }

  rowsEl.addEventListener('click', function (event) {
    const { target } = event
    if (!target.classList.contains('alert-dismiss')) return
    const { alertId } = target.dataset
    deleteAlert(alertId).catch(function (err) {
      console.error('Error deleting alert', alertId, err)
    })
  })
})()
