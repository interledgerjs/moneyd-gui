;(function () {
  const SERVICE_WORKER_URL = window.location.origin + '/pay/sw-interledger.js'
  // Adds the BobPay default instrument.
  function addInstruments (registration) {
    registration.paymentManager.userHint = 'test@interledgerpay.xyz'
    return Promise.all([
      registration.paymentManager.instruments.set(
        '5c077d7a-0a4a-4a08-986a-7fb0f5b08b13',
        {
          name: 'Ripple via ILP',
          icons: [{
            src: '/pay/images/ilp_icon.png',
            sizes: '32x32',
            type: 'image/png'}
          ],
          method: 'interledger'
        }),
      registration.paymentManager.instruments.set(
        'new-card',
        {
          name: 'Add a new card to BobPay',
          method: 'basic-card',
          capabilities: {
            supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
            supportedTypes: ['credit', 'debit', 'prepaid']
          }
        })
    ])
  };

  function registerPaymentAppServiceWorker () {
    navigator.serviceWorker.register(SERVICE_WORKER_URL).then(function (registration) {
      console.log('registration', registration)
      if (!registration.paymentManager) {
        registration.unregister().then((success) => {})
        console.log('Payment app capability not present. Enable flags?')
        return
      }
      addInstruments(registration).then(function () {
        console.log('Successfully registered!')
        showBobPayStatus(true)
      })
    }).catch((error) => {
      console.log('Service worker registration error', error)
    })
  }
  // Registers the payment app service worker by installing the default
  // instruments.
  function unregisterPaymentAppServiceWorker () {
    navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL).then(function (registration) {
      registration.unregister().then((success) => {
        console.log('Successfully unregistered!')
        showBobPayStatus(false)
      })
    })
  }

  navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL).then(function (registration) {
    if (registration) {
      // BobPay service worker is installed.
      if (registration.paymentManager) {
        // Always update the installed service worker.
        showBobPayStatus(true)
        registration.update()
      } else {
        // Not supposed to have a BobPay service worker if there is no
        // paymentManager available (feature is now off?). Remove the
        // service worker.
        unregisterPaymentAppServiceWorker()
      }
    }
  })
  function showBobPayStatus (enabled) {
    var buttonText = enabled ? 'Enabled' : 'Enable Web Payments'
    var id = enabled ? 'enable-webpayments' : 'webpayments-enabled'
    const webPaymentButton = document.getElementById(id)
    webPaymentButton.onclick = function () {
      return false
    }
    webPaymentButton.id = enabled ? 'webpayments-enabled' : 'enable-webpayments'
    webPaymentButton.innerHTML = buttonText
    if (enabled) {
      webPaymentButton.onclick = () => {
        unregisterPaymentAppServiceWorker()
      }
    } else {
      webPaymentButton.onclick = () => {
        registerPaymentAppServiceWorker()
      }
    }
  }

  const enableWebPayments = document.getElementById('enable-webpayments')
  const unregisterWebPayment = document.getElementById('webpayments-enabled')
  if (enableWebPayments) {
    enableWebPayments.onclick = () => {
      registerPaymentAppServiceWorker()
    }
  }
  if (unregisterWebPayment) {
    unregisterWebPayment.onclick = () => {
      unregisterPaymentAppServiceWorker()
    }
  }
  function getWhitelistItemTemplate (cursor) {
    const uniqueId = `display-item-${cursor.id}`
    return `<div class="row item-row" id="${uniqueId}">
              <div class="col-md-4 domain">
                <p><a href=${cursor.domain}>${cursor.domain}</a></p>
              </div>
              <div class="col-md-2 currency">
                <p> ${cursor.currency} </p>
              </div>
              <div class="col-md-2 value">
                <p> ${cursor.capAmount} </p>
              </div>
              <div class="col-md-1 edit">
                <button class="btn btn-success">
                  Edit
                </button>
              </div>
              <div class="col-md-1 remove">
                <button class="btn btn-danger">
                  Remove
                </button>
              </div>
    </div>`
  };

  function getNewItemTemplate () {
    return `<div class="row item-row" id="new-list-item">
        <div class="col-md-4 domain">
          <input class="form-control" placeholder="https://www.amazon.com/">
        </div>
        <div class="col-md-2 currency">
          <input class="form-control" placeholder = "XRP">
        </div>
        <div class="col-md-2 value">
          <input class="form-control" placeholder = "10">
        </div>
        <div class="col-md-1 done">
          <button class="btn btn-primary">
            Done
          </button>
        </div>
    </div>
    `
  }

  function removeFromWhitelist (domain, uniqueId) {
    const listItem = document.querySelector(`#display-item-${uniqueId}`)
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
          const removeRequest = objStore.delete(uniqueId)
          removeRequest.onsuccess = function (event) {
            // Should log undefined
            console.log('Successfully removed', index.get(domain))
            listItem.style.display = 'none'
          }
        }
        transaction.oncomplete = function () {
          db.close()
        }
      }
    }
  };

  function editWhitelistItem (domain, uniqueId, currency, capAmount) {
    const editDiv = document.querySelector(`#display-item-${uniqueId} .edit`)
    const editButton = document.querySelector(`#display-item-${uniqueId} .edit button`)
    const currencyDiv = document.querySelector(`#display-item-${uniqueId} .currency`)
    const currencyPara = document.querySelector(`#display-item-${uniqueId} .currency p`)
    const valueDiv = document.querySelector(`#display-item-${uniqueId} .value`)
    const valuePara = document.querySelector(`#display-item-${uniqueId} .value p`)
    // Make currency and value a text box.
    currencyPara.remove()
    valuePara.remove()
    const newCurrencyInput = document.createElement('input')
    const newValueInput = document.createElement('input')
    newCurrencyInput.className = 'form-control currency-input'
    newCurrencyInput.value = currency
    newValueInput.className = 'form-control value-input'
    newValueInput.value = capAmount
    newValueInput.type = 'number'

    currencyDiv.appendChild(newCurrencyInput)
    valueDiv.appendChild(newValueInput)

    editDiv.className = 'done'
    const newButton = editButton.cloneNode(true)
    editDiv.replaceChild(newButton, editButton)
    newButton.addEventListener('click', function () {
      finishEditingItem(domain, uniqueId)
    })
    newButton.innerHTML = 'Done'
  }

  function revertDomElements (domain, uniqueId, newCurrency, newValue) {
    const doneDiv = document.querySelector(`#display-item-${uniqueId} .done`)
    const doneButton = document.querySelector(`#display-item-${uniqueId} .done button`)
    const currencyDiv = document.querySelector(`#display-item-${uniqueId} .currency`)
    const currencyInput = document.querySelector(`#display-item-${uniqueId} .currency input`)
    const valueDiv = document.querySelector(`#display-item-${uniqueId} .value`)
    const valueInput = document.querySelector(`#display-item-${uniqueId} .value input`)

    currencyInput.remove()
    valueInput.remove()

    const newCurrencyPara = document.createElement('p')
    const newValuePara = document.createElement('p')
    newCurrencyPara.innerHTML = newCurrency
    newValuePara.innerHTML = newValue
    currencyDiv.appendChild(newCurrencyPara)
    valueDiv.appendChild(newValuePara)

    doneDiv.className = 'edit'
    const newButton = doneButton.cloneNode(true)
    doneDiv.replaceChild(newButton, doneButton)
    newButton.addEventListener('click', function () {
      editWhitelistItem(domain, uniqueId, newCurrency, newValue)
    })
    newButton.innerHTML = 'Edit'
  }

  function finishEditingItem (domain, uniqueId) {
    const newCurrency = document.querySelector(`#display-item-${uniqueId} .currency .currency-input`).value
    const newValue = document.querySelector(`#display-item-${uniqueId} .value .value-input`).value
    if (!window.indexedDB) {
      console.log('This browser does not support Indexed')
    } else {
      const request = window.indexedDB.open('walletConfig', 2)
      request.onerror = function (event) {
        console.log('Database error: ' + event.target.errorCode)
      }
      request.onsuccess = function () {
        const db = request.result
        const transaction = db.transaction(['whitelist'], 'readwrite')
        const objStore = transaction.objectStore('whitelist')
        // update new element
        const index = objStore.index('domain')
        const item = index.get(domain)
        item.onsuccess = function () {
          const data = item.result
          data.currency = newCurrency
          data.capAmount = newValue
          console.log('new data', data)
          const requestUpdate = objStore.put(data)
          requestUpdate.onerror = function (event) {
            console.log('Error', event.target.errorCode)
          }
          requestUpdate.onsuccess = function (event) {
            console.log('new Update!', index.get(domain))
            revertDomElements(domain, uniqueId, newCurrency, newValue)
          }
        }
      }
    }
  }

  function finishAddingItem (domain, uniqueId, currency, value) {
    const newListItem = document.querySelector('#new-list-item')
    newListItem.remove()
    const domainContainer = document.querySelector('#whitelist-items')
    const htmlString = getWhitelistItemTemplate({
      domain,
      id: uniqueId,
      currency,
      capAmount: value
    })
    const newItem = document.createElement('div')
    newItem.innerHTML = htmlString
    domainContainer.appendChild(newItem)
    console.log('domainContainer', domainContainer)
    const removeElement = document.querySelector(`#display-item-${uniqueId} .remove button`)
    const editElement = document.querySelector(`#display-item-${uniqueId} .edit button`)
    removeElement.onclick = function () {
      removeFromWhitelist(domain, uniqueId)
    }
    const func = function startEditing () {
      editWhitelistItem(domain, uniqueId, currency, value)
    }
    editElement.onclick = func
  }
  function addWhitelistItem () {
    const newListItem = document.querySelector('#new-list-item')

    if (!newListItem) {
      // Only add new if it's not already there.
      const newItem = document.createElement('div')
      newItem.innerHTML = getNewItemTemplate()
      const domainContainer = document.querySelector('#whitelist-items')
      domainContainer.appendChild(newItem)
      const doneButton = document.querySelector('#new-list-item .done button')
      doneButton.addEventListener('click', appendToDB)
    }
  }
  function appendToDB () {
    const newDomain = document.querySelector('#new-list-item .domain input').value
    const newCurrency = document.querySelector('#new-list-item .currency input').value
    const newValue = document.querySelector('#new-list-item .value input').value

    if (!window.indexedDB) {
      console.log('This browser does not support IndexedDB')
    } else {
      const request = window.indexedDB.open('walletConfig', 2)
      request.onerror = function (event) {
        console.log('Database error: ' + event.target.errorCode)
      }
      request.onsuccess = function () {
        const db = request.result
        let transaction = db.transaction(['whitelist'], 'readwrite')
        let objStore = transaction.objectStore('whitelist')
        let addRequest = objStore.put({
          domain: newDomain,
          currency: newCurrency,
          capAmount: newValue
        })
        addRequest.onsuccess = function (event) {
          console.log('made it!', event.target.result)

          finishAddingItem(newDomain, event.target.result, newCurrency, newValue)
        }
        transaction.oncomplete = function () {
          db.close()
        }
      }
    }
  }

  function displayWhitelist () {
    // Gather entries of everything in white list. Allow users to remove and change max payment.
    if (!window.indexedDB) {
      console.log('This browser doesn\'t support IndexedDB')
    } else {
      let request = window.indexedDB.open('walletConfig', 2)
      request.onerror = function (event) {
        console.log('Database error: ' + event.target.errorCode)
      }

      request.onupgradeneeded = function () {
        let db = request.result
        if (!db.objectStoreNames.contains('whitelist')) {
          let store = db.createObjectStore('whitelist', {keyPath: 'id', autoIncrement: true})
          store.createIndex('domain', 'domain', { unique: true })
        }
      }

      request.onsuccess = function () {
        const domainContainer = document.querySelector('#whitelist-items')
        let db = request.result
        let transaction = db.transaction(['whitelist'], 'readwrite')
        let objStore = transaction.objectStore('whitelist')
        objStore.openCursor().onsuccess = function (event) {
          let cursor = event.target.result
          if (cursor) {
            const templateString = getWhitelistItemTemplate(cursor.value)
            const item = document.createElement('div')
            item.innerHTML = templateString
            domainContainer.appendChild(item)
            let removeElement = document.querySelector(`#display-item-${cursor.value.id} .remove button`)
            let editElement = document.querySelector(`#display-item-${cursor.value.id} .edit button`)
            const {domain, id, currency, capAmount} = cursor.value
            removeElement.onclick = function () {
              removeFromWhitelist(domain, id)
            }
            const func = function startEditing () {
              editWhitelistItem(domain, id, currency, capAmount)
            }
            editElement.onclick = func.bind(cursor)
            cursor.continue()
          } else {
            console.log('all entries finished')
          }
        }
      }
    }
  }
  displayWhitelist()
  function initialise () {
    const addButton = document.querySelector('#add-item')
    addButton.addEventListener('click', addWhitelistItem)
  }
  window.onload = initialise()
  // if (window.addEventListener) {
  //   console.log('what')
  //   window.addEventListener('load', initialise)
  // } else if (window.attachEvent) {
  //   window.attachEvent('onload', initialise)
  // } else {
  //   document.addEventListener('load', initialise)
  // }
})()
