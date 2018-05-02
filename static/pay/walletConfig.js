;(function () {
  console.log("window locatino", window.location.origin)
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
    var buttonText = enabled ?
      'Enabled' : 'Enable Web Payments'
    var id = enabled ?
      'enable-webpayments' : 'webpayments-enabled'
    const webPaymentButton = document.getElementById(id)
    webPaymentButton.onclick = function () {
      return false
    }
    webPaymentButton.id = enabled ?
      'webpayments-enabled' : 'enable-webpayments'
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
})()
