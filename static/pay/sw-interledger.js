let payment_request_event = undefined
let payment_request_resolver = undefined

self.addEventListener('canmakepayment', function (e) {
  e.responseWith(true)
})

self.addEventListener('paymentrequest', function (e) {
  payment_request_event = e
  payment_request_resolver = new PromiseResolver()
  e.respondWith(payment_request_resolver.promise)
  // The methodData here represents what the merchant supports. We could have a
  // payment selection screen, but for this simple demo if we see interledger in the list
  // we send the user through the interledger flow.
  let url = 'http://localhost:7770/pay/interledger.html'
  if (e.methodData[0].supportedMethods[0].indexOf('interledger') === -1) {
    console.log('Interledger not supported')
    return false
  }
  e.openWindow(url)
    .then(windowClient => {
      if (windowClient === null) {
        payment_request_resolver.reject('Failed to open window')
      }
    })
    .catch(function (err) {
      payment_request_resolver.reject(err)
    })
})

self.addEventListener('message', listener = function (e) {
  if (e.data === 'payment_app_window_ready') {
    sendPaymentRequest()
    return
  }

  if (e.data.methodName) {
    payment_request_resolver.resolve(e.data)
  } else {
    payment_request_resolver.reject(e.data)
  }
})

function sendPaymentRequest () {
  let options = {
    includeUncontrolled: false,
    type: 'window'
  }

  clients.matchAll(options).then(function (clientList) {
    for (let i = 0; i < clientList.length; i++) {
      clientList[i].postMessage({
        paymentRequestId: payment_request_event.paymentRequestId,
        paymentRequestOrigin: payment_request_event.paymentRequestOrigin,
        instrumentKey: payment_request_event.instrumentKey,
        methodData: payment_request_event.methodData
      })
      // white list paymentRequestOrigin to always if below a certain amount. Default to be below default 15 USD?
      if (!indexedDB) {
        console.log('This browser doesn\'t support IndexedDB')
      } else {
        let request = indexedDB.open('walletConfig', 2)
        request.onerror = function (event) {
          console.log('Database error: ' + event.target.errorCode)
        }
        request.onupgradeneeded = function () {
          let db = request.result
          console.log('request result', request.result)
          if (!db.objectStoreNames.contains('whitelist')) {
            console.log('created?')
            let store = db.createObjectStore('whitelist', {keyPath: 'id', autoIncrement: true})
            let index = store.createIndex('domain', 'domain', { unique: true })
          }
        }
        request.onsuccess = function () {
          let db = request.result
          console.log('second request', request.result)
          let transaction = db.transaction(['whitelist'], 'readwrite')
          let objStore = transaction.objectStore('whitelist')
          let index = objStore.index('domain')
          let item = index.get(payment_request_event.paymentRequestOrigin)
          console.log("item?", item)
          if (item) {
            let addRequest = objStore.put({
              domain: payment_request_event.paymentRequestOrigin,
              currency: 'USD',
              capAmount: 15
            })
            addRequest.onsuccess = function (event) {
              console.log('made it!', index.get(payment_request_event.paymentRequestOrigin))
            }
          }
          transaction.oncomplete = function () {
            db.close()
          }
        }
      }
    }
  })
}

function PromiseResolver () {
  /** @private {function(T=): void} */
  this.resolve_

  /** @private {function(*=): void} */
  this.reject_

  this.promise_ = new Promise(function (resolve, reject) {
    this.resolve_ = resolve
    this.reject_ = reject
  }.bind(this))
}

PromiseResolver.prototype = {
  get promise () {
    return this.promise_
  },
  get resolve () {
    return this.resolve_
  },
  get reject () {
    return this.reject_
  }
}
