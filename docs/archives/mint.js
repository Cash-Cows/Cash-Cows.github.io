window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const keys = Array.from(document.querySelectorAll('div.keypad a'))
  const message = document.querySelector('div.monitor div.connected.message')

  const verified = await (await fetch('/data/verified.json')).json()
  verified.allowlist = {}

  const authorizedTime = 0
  const allowedTime = 0

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const price = await nft.read().MINT_PRICE()
  const maxFree = await nft.read().maxFreePerWallet()

  let opened = await nft.read().mintOpened()

  //public mint config by default
  const config = { maxMint: 9, maxFree, minted: 0, list: 'public' }
  //intervals
  const intervals = {}

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
    //determine the config
    config.account = state.account.toLowerCase()
    if (verified.whitelist[config.account]) {
      config.list = 'whitelist'
      config.maxFree = verified.whitelist[config.account]
    }

    config.minted = await nft.read().minted(state.account)
    config.canMint = config.maxMint - config.minted
    //is it their time to mint?
    message.innerHTML = 'Choose Mint Amount...'
  }

  const disconnected = async (state, error, session) => {
    config.maxMint = 9
    config.maxFree = maxFree
    config.minted = 0
    config.list = 'public'
    console.log('dc', intervals)
    for (const interval in intervals) {
      clearInterval(interval)
    }
    window.location.reload()
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('amount-click', async e => {
    return notify('error', 'Minting now closed')
    if (!Web3SDK.state?.account) {
      return notify('error', 'Please connect your wallet first...')
    }

    const quantity = parseInt(e.for.getAttribute('data-value'))

    if (quantity > config.canMint) {
      return notify('error', `You minted ${config.minted} already, so you can only mint ${config.canMint} more.`)
    }

    Web3SDK.state.quantity = quantity
    
    let freeLeft = config.maxFree - config.minted
    if (freeLeft < 0) freeLeft = 0
    let totalPrice = `${Web3SDK.toEther(
      price.toString()) * (Web3SDK.state.quantity - freeLeft
    )} ETH`
    if (Web3SDK.state.quantity <= freeLeft) {
      totalPrice = 'FREE'
    }

    message.innerHTML = `${Web3SDK.state.quantity} = ${totalPrice}.<br />Pull the lever.`
    keys.forEach(key => key.classList.remove('active'))
    e.for.classList.add('active')
  })

  window.addEventListener('mint-click', async e => {
    return notify('error', 'Minting now closed')
    const { account, quantity } = Web3SDK.state
    //if no account
    if (!account) {
      return notify('error', 'Please connect your wallet first...')
    //no quantity
    } else if (!quantity) {
      return notify('error', 'Use the Number Pad to Choose a Mint Amount...')
    }

    //check supply
    const supply = await nft.read().totalSupply()
    if ((parseFloat(quantity) + parseFloat(supply)) > 7777) {
      return notify('error', 'Moo :( no more cows left.')
    }

    //default settings for public mint
    let method = 'mint(uint256)'
    const args = [ quantity ]
    //if not public mint
    if (config.list !== 'public') {
      //if no proof, get it
      if (!config.proof) {
        config.proof = (await (
          await fetch(`/data/proof/${account.substring(10, 12).toLowerCase()}.json`)
        ).json())[account.toLowerCase()]
      }

      //only if there is a proof
      if (config.proof) {
        //change up the method
        //use WL method and args
        method = 'mint(uint256,uint256,uint256,bytes)'
        //args.push.apply(args, [ 9, 7, config.proof ])
        args.push.apply(args, [ config.maxMint, config.maxFree, config.proof ])
      }
    //if public
    } else {
      //if not opened, try to open it
      if (!opened) opened = await nft.read().mintOpened()
      //if still not opened
      if (!opened) return notify('error', 'Your mint time has not started')
    }

    //no more errors, we can start minting
    e.for.classList.add('active')
    message.innerHTML = `Minting ${quantity}...`
    //determine the price that needs to be paid
    let freeLeft = config.maxFree - config.minted
    if (freeLeft < 0) freeLeft = 0
    const totalPrice = quantity > freeLeft
      ? price * (quantity - freeLeft)
      : 0

    const priceText = totalPrice ? Web3SDK.toEther(totalPrice): 'FREE'

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
    //lever up
    e.for.classList.remove('active')

    //gas check
    try {
      await gas[method](...args)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'number').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'number').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      message.innerHTML = `${quantity} = ${priceText}.<br />Pull the lever.`
      return
    }

    try {//to mint
      await write[method](...args)
    } catch(e) {
      notify('error', e.message)
      console.error(e)
      message.innerHTML = `${quantity} = ${priceText}.<br />Pull the lever.`
      return
    }
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