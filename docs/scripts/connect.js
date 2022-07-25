(async (window) => {
  //sets up the Web3 SDK
  await Web3SDK.setupJSON(`/data/${
    document.getElementById('network').getAttribute('data-value')
  }.json`)

  //------------------------------------------------------------------//
  // Variables

  const WalletConnectProvider = window.WalletConnectProvider.default
  const Fortmatic = window.Fortmatic

  const providers = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      }
    },

    fortmatic: {
      package: Fortmatic,
      options: {
        // Mikko's TESTNET api key
        key: "pk_test_391E26A3B43A3350"
      }
    }
  }

  Web3SDK.state = { connected: false }

  const network = Web3SDK.network('ethereum')

  let listening = false

  //------------------------------------------------------------------//
  // Functions

  const connected = async (newstate, session) => {
    //update state
    Object.assign(Web3SDK.state, newstate, { connected: true })
    //update loggedin state
    window.localStorage.setItem('WEB3_LOGGED_IN', true)
    //update HTML state
    theme.hide('.connected', false)
    theme.hide('.disconnected', true)
    //if not connected via session
    if (!session) {
      notify('success', 'Wallet connected')
    }

    Array.from(document.querySelectorAll('.btn-address')).forEach((button) => {
      button.innerHTML = `${Web3SDK.state.account.substring(0, 4)}...${
        Web3SDK.state.account.substring(Web3SDK.state.account.length - 4)
      }`
    })
  }

  const disconnected = async (newstate, error, session) => {
    //update state
    Object.assign(Web3SDK.state, newstate)
    //update loggedin state
    window.localStorage.setItem('WEB3_LOGGED_IN', false)
    //if error, report it
    if (!session && error) notify('error', error.message)
    //update html state
    theme.hide('.connected', true)
    theme.hide('.disconnected', false)
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('connect-click', () => {
    network.connectCB(providers, connected, disconnected, listening === false)
    listening = true
  })

  window.addEventListener('disconnect-click', () => {
    disconnected({ connected: false, account: undefined, provider: undefined })
  })

  //------------------------------------------------------------------//
  // Initialize
  window.doon(document.body)

  if (window.localStorage.getItem('WEB3_LOGGED_IN') === 'true') {
    network.startSession(connected, disconnected, listening === false)
    listening = true
  }

  try {
    window.dispatchEvent(new Event('web3sdk-ready'))
  } catch(e) {
    console.error(e)
  }
})(window)