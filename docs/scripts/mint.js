window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const keys = Array.from(document.querySelectorAll('div.keypad a'))
  const message = document.querySelector('div.monitor div.connected.message')

  const verified = await (await fetch('/data/verified.json')).json()

  const authorizedTime = Date.now() + (1000 * 20)//1659139200000
  const allowedTime = Date.now() + (1000 * 20 * 2)//1659186000000

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const price = await nft.read().MINT_PRICE()
  const maxFree = 1//await nft.read().maxFreePerWallet()

  let opened = await nft.read().mintOpened()

  //public mint config by default
  const config = { maxMint: 9, maxFree, minted: 0, list: 'public' }

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
    //determine the config
    config.account = state.account.toLowerCase()
    if (verified.whitelist[config.account]) {
      config.list = 'whitelist'
      if (!opened) config.maxFree = verified.whitelist[config.account]
    } else if (verified.allowlist[config.account]) {
      config.list = 'allowlist'
      if (!opened) config.maxFree = 0
    }
    config.minted = await nft.read().minted(state.account)
    config.canMint = config.maxMint - config.minted
    //is it their time to mint?
    if (config.list === 'public' && !opened) {
      waitForPublic()
    } else if (config.list === 'allowlist' && allowedTime > Date.now()) {
      waitForAllowlist()
    } else if (config.list === 'whitelist' && authorizedTime > Date.now()) {
      waitForWhitelist()
    }
  }

  const waitForPublic = _ => {
    const interval = setInterval(async () => {
      message.innerHTML = 'Checking...'
      opened = await nft.read().mintOpened()
      if (!opened) {
        clearInterval(interval)
        message.innerHTML = 'Choose Mint Amount...'
      }
    }, 5000)
  }

  const waitForWhitelist = _ => {
    const interval = setInterval(_ => {
      const diff = authorizedTime - Date.now()
      if (diff > 0) {
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const diffMinutes = Math.floor((diff / (1000 * 60)) % 60)
        const diffSeconds = Math.floor((diff / 1000) % 60)
        message.innerHTML = 'Starts in<br>' + [
          diffDays < 10 ? "0" + diffDays : diffDays,
          diffHours < 10 ? "0" + diffHours : diffHours,
          diffMinutes < 10 ? "0" + diffMinutes : diffMinutes,
          diffSeconds < 10 ? "0" + diffSeconds : diffSeconds
        ].join(':')
        return
      }
      clearInterval(interval)
      message.innerHTML = 'Choose Mint Amount...'
    }, 1000)
  }

  const waitForAllowlist = _ => {
    const interval = setInterval(_ => {
      const diff = allowedTime - Date.now()
      if (diff > 0) {
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const diffMinutes = Math.floor((diff / (1000 * 60)) % 60)
        const diffSeconds = Math.floor((diff / 1000) % 60)
        message.innerHTML = 'Starts in<br>' + [
          diffDays < 10 ? "0" + diffDays : diffDays,
          diffHours < 10 ? "0" + diffHours : diffHours,
          diffMinutes < 10 ? "0" + diffMinutes : diffMinutes,
          diffSeconds < 10 ? "0" + diffSeconds : diffSeconds
        ].join(':')
        return
      }
      clearInterval(interval)
      message.innerHTML = 'Choose Mint Amount...'
    }, 1000)
  }

  const disconnected = async (state, error, session) => {}

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('amount-click', async e => {
    if (!Web3SDK.state?.account) {
      return notify('error', 'Please connect your wallet first...')
    }

    const quantity = parseInt(e.for.getAttribute('data-value'))

    if (quantity > config.canMint) {
      return notify('error', `You minted ${config.minted} already, so you can only mint ${config.canMint} more.`)
    }

    message.innerHTML = 'Loading...'
    Web3SDK.state.quantity = quantity

    //if not opened
    if (!opened) {
      //check again
      opened = await nft.read().mintOpened()
    }

    //if still not opened
    if (!opened) {
      //if whitelist and not time
      if ((config.list === 'allowlist' && allowedTime > Date.now()) 
        //or allowlist and not time
        || (config.list === 'whitelist' && authorizedTime > Date.now()) 
        //or public
        || config.list === 'public'
      ) {
        //show error
        message.innerHTML = 'Choose Mint Amount...'
        return notify('error', 'Your mint time has not started')
      }
    }

    let totalPrice = `${Web3SDK.toEther(
      price.toString()) * (Web3SDK.state.quantity - config.maxFree
    )} ETH`
    if (Web3SDK.state.quantity <= config.maxFree) {
      totalPrice = 'FREE'
    }

    message.innerHTML = `${Web3SDK.state.quantity} = ${totalPrice}.<br />Pull the lever.`
    keys.forEach(key => key.classList.remove('active'))
    e.for.classList.add('active')
  })

  window.addEventListener('mint-click', async e => {
    if (!Web3SDK.state?.quantity) {
      return notify('error', 'Use the Number Pad to Choose a Mint Amount...')
    }

    //check proof
    if (!config.proof)

    e.for.classList.add('active')
    message.innerHTML = `Minting ${Web3SDK.state.quantity}...`

    if (!opened) {
      opened = await nft.read().mintOpened()
    } else {
      const supply = await nft.read().totalSupply()
      if ((Web3SDK.state.quantity + supply) > 7777) {
        return notify('error', 'Moo :( no more cows left.')
      }
    }

    //if opened now
    if (opened) {
      //use the public settings
      config.maxMint = maxMint
      config.maxFree = maxFree
    }

    let totalPrice = price * (Web3SDK.state.quantity - config.maxFree)
    if (Web3SDK.state.quantity <= config.maxFree) {
      totalPrice = 0
    }

    const confirmations = 2
    const gas = nft.gas(Web3SDK.state.account, totalPrice)
    const write = nft.write(Web3SDK.state.account, totalPrice, {
      hash: function(resolve, reject, hash) {
        notify(
         'success', 
         `Transaction started on <a href="${network.config.chain_scanner}/tx/${hash}" target="_blank">
           ${network.config.chain_scanner}
         </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
         1000000
        )
      },
      confirmation: function(resolve, reject, confirmationNumber, receipt) {
        if (confirmationNumber > confirmations) return
        if (confirmationNumber == confirmations) {
         notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
         </a>.`)
         message.innerHTML = `Success! List for 1 ETH... Mo0oOo!`
         resolve()
         return
        }
        notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
         ${network.config.chain_scanner}
        </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
      },
      receipt: function(resolve, reject, receipt) {
        notify(
         'success', 
         `Confirming on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
         </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
         1000000
        )
      }
    })
    e.for.classList.remove('active')
    
    //by default, public mint
    let method = 'mint(uint256)'
    const args = [ Web3SDK.state.quantity ]
    //but if it's whitelist time
    if (!opened) {
      //if no proof
      if (!config.proof) {
        return notify('error', 'You are not allowed to mint right now...')
      }
      //use WL method and args
      method = 'mint(uint256,uint256,uint256,bytes)'
      //args.push.apply(args, [ 10, 7, config.proof ])
      args.push.apply(args, [ config.maxMint, config.maxFree, config.proof ])
    }

    //gas check
    try {
      await gas[method](...args)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'int').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'int').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }

    //now mint
    await write[method](...args)
  })

  //------------------------------------------------------------------//
  // Initialze

  const interval = setInterval(async () => {
    const supply = await nft.read().totalSupply()
    document
      .querySelector('section.section-2 div.monitor')
      .innerHTML = `${supply} / 7777`
    if (supply >= 7777) {
      clearInterval(interval)
    }
  }, 5000)

  const intervalAuthorize = setInterval(async () => {
    const diff = authorizedTime - Date.now()
    if (diff > 0) {
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const diffMinutes = Math.floor((diff / (1000 * 60)) % 60)
      const diffSeconds = Math.floor((diff / 1000) % 60)

      message.innerHTML = 'Starts in<br>' + [
        diffDays < 10 ? "0" + diffDays : diffDays,
        diffHours < 10 ? "0" + diffHours : diffHours,
        diffMinutes < 10 ? "0" + diffMinutes : diffMinutes,
        diffSeconds < 10 ? "0" + diffSeconds : diffSeconds
      ].join(':')
      return
    }
    clearInterval(intervalAuthorize)
    authorized = await (await fetch(
      '/data/authorized.json', 
      { refresh: true }
    )).json()
    await connected(Web3SDK.state || {})
    message.innerHTML = 'Choose Mint Amount...'
  }, 1000)

  const intervalAllow = setInterval(async () => {
    const diff = allowedTime - Date.now()
    if (diff > 0) return
    clearInterval(intervalAllow)
    allowed = await (await fetch(
      '/data/allowed.json', 
      { refresh: true }
    )).json()
    await connected(Web3SDK.state || {})
  }, 1000)

  network.startSession(connected, disconnected, true)
})