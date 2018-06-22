let payment_request_event
let payment_request_resolver

self.addEventListener('canmakepayment', function (e) {
  e.responseWith(true)
})

self.addEventListener('paymentrequest', function (e) {
  payment_request_event = e
  payment_request_resolver = new PromiseResolver()
  try {
    e.respondWith(payment_request_resolver.promise)
  } catch (e) {
    console.log('error', e)
  }

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
