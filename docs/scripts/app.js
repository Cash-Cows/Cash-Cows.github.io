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
    cow: document.getElementById('template-cow').innerHTML
  }

  const element = {
    member: document.querySelector('section.panel-user-menu a.member'),
    hascows: {
      items: document.querySelector('section.panel-user-menu main.hascows')
    },
    nocows: {
      container: document.querySelector('section.panel-user-menu main.hasnocows'),
      input: document.querySelector('main.panel-body.hasnocows input.input-newcows'),
      total: document.querySelector('footer.panel-foot.hasnocows div.total div.amount')
    },
    panel: {
      left: document.querySelector('aside.panel-left'),
      right: document.querySelector('aside.panel-right')
    }
  }

  let listening = false
  let forSale = []

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

    !Web3SDK.state.owned.crew.length 
      ? await loadBuy()
      : await loadCows()

    setTimeout(_ => {
      window.dispatchEvent(new Event('web3sdk-connected'))
    }, 100)
  }

  const loadBuy = async () => {
    theme.hide('.hasnocows', false)
    const params = new URLSearchParams()
    params.set('collection', `0x.${contract.crew.address.substring(2)}`)
    params.set('limit', '10')
    params.set('sortBy', 'floorAskPrice')

    const response = await fetch(
      `https://www.incept.asia/cashcows/reservoir/tokens/v5?${
        decodeURIComponent(params.toString())
      }`
    )

    const json = await response.json()
    if (json.error) return

    forSale = json.results.tokens.map(row => ({
      token: row.token.tokenId,
      currency: row.market.floorAsk.price.currency.symbol.toLowerCase(),
      source: row.market.floorAsk.source.name.toLowerCase(),
      amount: row.market.floorAsk.price.amount.decimal
    })).filter(row => row.currency === 'eth' && row.source === 'opensea')
    
    element.nocows.input.setAttribute('max', forSale.length)
    element.nocows.total.innerHTML = ` ${toFixedNumber(forSale[0].amount)}`
  }

  const loadCows = async () => {
    theme.hide('.hascows', false)

    element.hascows.items.innerHTML = ''

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

      element.hascows.items.appendChild(item)
      window.doon(item)
    })
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
    theme.hide('.hascows', true)
    theme.hide('.hasnocows', true)

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

  const toFixedNumber = function(number, length = 6) {
    const parts = number.toString().split('.')
    const size = length >= parts[0].length ? length - parts[0].length: 0
    if (parts[0].length > 9) {
      return (parseInt(parts[0]) / 1000000000).toFixed(2) + 'B'
    } else if (parts[0].length > 6) {
      return (parseInt(parts[0]) / 1000000).toFixed(2) + 'M'
    } else if (parts[0].length > 3) {
      return (parseInt(parts[0]) / 1000).toFixed(2) + 'K'
    }
    return number.toFixed(size)
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

  window.addEventListener('nocows-input', _ => {
    const value = parseInt(element.nocows.input.value)

    let total = 0
    for (let i = 0; i < value && i < forSale.length; i++) {
      total += forSale[i].amount
    }

    element.nocows.total.innerHTML = ` ${toFixedNumber(total)}`
  })

  window.addEventListener('nocows-sub-click', _ => {
    const min = parseInt(element.nocows.input.getAttribute('min'))
    if (parseInt(element.nocows.input.value) <= min) return

    const value = parseInt(element.nocows.input.value) - 1
    element.nocows.input.value = value

    let total = 0
    for (let i = 0; i < value && i < forSale.length; i++) {
      total += forSale[i].amount
    }

    element.nocows.total.innerHTML = ` ${toFixedNumber(total)}`
  })

  window.addEventListener('nocows-add-click', _ => {
    const max = parseInt(element.nocows.input.getAttribute('max'))
    if (parseInt(element.nocows.input.value) >= max) return

    const value = parseInt(element.nocows.input.value) + 1
    element.nocows.input.value = value

    let total = 0
    for (let i = 0; i < value && i < forSale.length; i++) {
      total += forSale[i].amount
    }

    element.nocows.total.innerHTML = ` ${toFixedNumber(total)}`
  })

  window.addEventListener('nocows-buy-click', async _ => {
    const value = parseInt(element.nocows.input.value)

    const tokens = []
    for (let i = 0; i < value && i < forSale.length; i++) {
      tokens.push(`${contract.crew.address}:${forSale[i].token}`)
    }

    if (!tokens.length) return

    const response = await fetch('https://www.incept.asia/cashcows/reservoir/execute/buy/v4', {
      method: 'POST',
      heaaders: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        onlyPath: false,
        partial: false,
        skipErrors: false,
        skipBalanceCheck: false,
        taker: Web3SDK.state.account,
        currency: '0x0000000000000000000000000000000000000000',
        tokens: tokens
      })
    })

    const json = await response.json()

    if (json.error) return notify('error', json.message)
    if (!Array.isArray(json.results?.steps)) 
      return notify('error', 'No steps provided')
    for (const step of json.results.steps) {
      if (!Array.isArray(step.items) || !step.items.length) continue
      for (const item of step.items) {
        //according to reservoir-client, it is possible 
        //for no data in item, we should poll if this is the case
        if (item.status !== 'incomplete' || !item.data) continue
        await Web3SDK.sendTransaction(item.data, _ => {
          window.location.reload()
        }, e => {
          const message = e.message || e.toString()
          const pattern = /have (\d+) want (\d+)/
          const matches = message.match(pattern)
          if (matches && matches.length === 3) {
            message = message.replace(pattern, `have ${
              Web3SDK.toEther(matches[1], 'int').toFixed(5)
            } ETH want ${
              Web3SDK.toEther(matches[2], 'int').toFixed(5)
            } ETH`)
          }
          return notify('error', message.replace('err: i', 'I'))
        })
      }
    }
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