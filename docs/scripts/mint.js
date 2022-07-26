window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const keys = Array.from(document.querySelectorAll('div.keypad a'))
  const message = document.querySelector('div.monitor div.connected.message')
  
  const authorized = await (await fetch('/data/authorized.json')).json()
  const allowed = await (await fetch('/data/allowed.json')).json()

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const price = await nft.read().MINT_PRICE()
  const maxFree = await nft.read().MAX_FREE_PER_WALLET()
  const maxMint = 9
  
  let opened = await nft.read().mintOpened()

  const config = { maxMint, maxFree, minted: 0 }

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
    //get the config for user
    if (authorized[state.account.toLowerCase()]) {
      config.account = state.account.toLowerCase()
      config.proof = authorized[config.account][2]
      if (!opened) {
        config.maxMint = authorized[config.account][0]
        config.maxFree = authorized[config.account][1]
      }
    } else if (allowed[state.account.toLowerCase()]) {
      config.account = state.account.toLowerCase()
      config.proof = allowed[config.account]
      if (!opened) {
        config.maxFree = 0
      }
    }

    config.minted = await nft.read().minted(state.account)
    config.canMint = config.maxMint - config.minted
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
    //if opened now
    if (opened) {
      //use the public settings
      config.maxMint = maxMint
      config.maxFree = maxFree
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

  network.startSession(connected, disconnected, true)
})