(async (window) => {
  //sets up the Web3 SDK
  const networkName = ['ethereum', 'goerli']
    .indexOf(window.location.pathname.split('/')[1]) >= 0
    ? window.location.pathname.split('/')[1]
    : 'ethereum'

  await Web3SDK.setupJSON(`/${networkName}/data/network.json`)

  //------------------------------------------------------------------//
  // Variables

  const WalletConnectProvider = window.WalletConnectProvider.default
  const Fortmatic = window.Fortmatic

  const providers = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "2a7154bb1cf244d9a412d1925398058c",
      }
    },
    fortmatic: {
      package: Fortmatic,
      options: {
        key: "pk_live_7C75AFDDC4136F81"
      }
    }
  }

  Web3SDK.state = { connected: false }

  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    game: network.contract('game'),
    index: network.contract('index'),
    royalty: network.contract('royalty'),
    metadata: network.contract('metadata')
  }

  const template = {
    cow: document.getElementById('template-cow').innerHTML,
    loot: document.getElementById('template-loot').innerHTML,
    attribute: document.getElementById('template-attribute').innerHTML
  }

  const element = {
    member: document.querySelector('section.panel-user-menu a.member'),
    cows: document.querySelector('section.panel-user-menu main.cows'),
    panel: {
      left: document.querySelector('aside.panel-left'),
      right: document.querySelector('aside.panel-right')
    }
  }

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
    //populate all address buttons
    element.member.setAttribute('href', `/${networkName}/member/?address=${Web3SDK.state.account}`)
    Array.from(document.querySelectorAll('.btn-address')).forEach((button) => {
      button.innerHTML = `${Web3SDK.state.account.substring(0, 4)}...${
        Web3SDK.state.account.substring(Web3SDK.state.account.length - 4)
      }`
    })

    //get the owners cows
    Web3SDK.state.owned = {
      crew: await contract.index.read().ownerTokens(
        contract.crew.address, 
        Web3SDK.state.account,
        4030
      )
    }

    if (!Web3SDK.state.owned.crew.length) {
      return disconnected(
        { connected: false }, 
        new Error('You dont have a cow')
      )
    }

    Web3SDK.state.owned.crew.forEach(async tokenId => {
      const stage = parseInt(await contract.metadata.read().stage(tokenId))
      const row = Web3SDK.state.crew.rows.filter(
        row => row.edition == tokenId
      )[0]

      if (!row) return

      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }

      const item = theme.toElement(template.cow, {
        '{NETWORK}': networkName,
        '{EDITION}': row.edition,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${tokenId}_${stage}.png`
      })

      element.cows.appendChild(item)
      window.doon(item)
    })

    setTimeout(_ => {
      window.dispatchEvent(new Event('web3sdk-connected'))
    }, 100)
  }

  const disconnected = (newstate, error, session) => {
    //update state
    Object.assign(Web3SDK.state, newstate)
    //update loggedin state
    window.localStorage.setItem('WEB3_LOGGED_IN', false)
    //if error, report it
    if (!session && error) notify('error', error.message)
    //update html state
    theme.hide('.connected', true)
    theme.hide('.disconnected', false)

    setTimeout(_ => {
      window.dispatchEvent(new Event('web3sdk-disconnected'))
    }, 100)
  }

  const getCrew = async function() {
    const database = await (
      await fetch(`/${networkName}/data/crew.json`)
    ).json()
    //remove burned
    database.rows = database.rows.filter(
      row => (row.attributes.Level.value || 0) > 0
    )
    //add indexes
    database.rows.forEach((row, i) => (row.index = i))
    
    return database
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('connect-click', _ => {
    network.connectCB(providers, connected, disconnected, listening === false)
    listening = true
  })

  window.addEventListener('disconnect-click', _ => {
    disconnected({ connected: false, account: undefined, provider: undefined })
  })

  window.addEventListener('panel-toggle-click', e => {
    const panel = e.for.getAttribute('data-panel')
    const opened = document
      .querySelector(`aside.panel-${panel}`)
      .classList.contains('panel-open')
    theme.toggle('aside.panel', 'panel-open', false)
    if (!opened) {
      theme.toggle(`aside.panel-${panel}`, 'panel-open', true)
    }
  })

  window.addEventListener('network-links-init', e => {
    e.for.querySelectorAll('a.network-link').forEach(link => {
      const href = link.getAttribute('href')
      link.setAttribute('href', href.replace('ethereum', networkName))
    })
  })

  //------------------------------------------------------------------//
  // Initialize

  try {
    window.dispatchEvent(new Event('web3sdk-ready'))
  } catch(e) {
    console.error(e)
  }

  getCrew().then(crew => {
    Web3SDK.state.crew = crew
    try {
      window.dispatchEvent(new Event('db-crew-ready'))
    } catch(e) {
      console.error(e)
    }
  })

  if (window.localStorage.getItem('WEB3_LOGGED_IN') === 'true') {
    network.startSession(connected, disconnected, listening === false)
    listening = true
  }

  window.doon(document.body)
})(window)