document.addEventListener('DOMContentLoaded', function (event) {
  function removeFromWhitelist (domain, uniqueId) {
    const listItem = document.querySelector(`#display-item-${uniqueId}`)
    console.log('listItem', listItem)
    if (!window.indexedDB) {
      console.log('This browser does\'t support IndexedDB')
    } else {
      let request = window.indexedDB.open('walletConfig', 2)
      request.onerror = function (event) {
        console.log('Database error: ' + event.target.errorCode)
      }
      // No upgrade needed
      request.onsuccess = function () {
        const db = request.result
        const transaction = db.transaction(['whitelist'], 'readwrite')
        const objStore = transaction.objectStore('whitelist')
        const index = objStore.index('domain')
        const item = index.get(domain)
        if (item) {
          // Remove item from IndexedDB
          console.log('item', item)
          const removeRequest = objStore.delete(uniqueId)
          removeRequest.onsuccess = function (event) {
            // Should log undefined
            console.log('Successfully removed', index.get(domain))
          }
        }
        transaction.oncomplete = function () {
          db.close()
        }
      }
    }
  }
})
