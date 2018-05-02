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
  let url = 'https://pink-mayfly-100.localtunnel.me/pay/interledger.html'
  if (e.methodData[0].supportedMethods[0].indexOf('interledger') === -1) {
    alert('Interledger not supported')
  }
  e.openWindow(url)
    .then(windowClient => {
      console.log('window client?', windowClient)
      if (windowClient === null) {
        payment_request_resolver.reject('Failed to open window')
      }
    })
    .catch(function (err) {
      console.log('Whats the error')
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
