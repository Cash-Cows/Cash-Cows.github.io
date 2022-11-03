window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const edition = window.location.pathname.split('/')[3] || 0
  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    barn: network.contract('barn'),
    milk: network.contract('milk')
  }

  const element = {
    rate: document.querySelector('div.rate span.value'),
    releaseable: document.querySelector('div.releaseable span.value'),
    ticker: document.querySelector('div.releaseable span.value')
  }

  //------------------------------------------------------------------//
  // Functions 
  
  const getRow = async _ => {
    return await (await fetch(`/${networkName}/data/crew/${edition}.json`)).json()
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    const row = await getRow()
    if (!row) window.location.href = `/${networkName}/crew/${edition}/profile.html`

    let releaseable = await (contract.barn.read().releaseable(
      contract.crew.address, 
      row.edition,
      row.rates[contract.milk.address].rate
    ))

    element.rate.innerHTML = `${Math.ceil(
      Web3SDK.toEther(row.rates[contract.milk.address].rate, 'number') 
      * 60 * 60 * 24
    )} / day`

    element.releaseable.innerHTML = Web3SDK
      .toEther(releaseable, 'number')
      .toFixed(6)

    setInterval(() => {
      releaseable = Web3SDK.toBigNumber(releaseable).add(
        Web3SDK.toBigNumber(row.rates[contract.milk.address].rate)
      ).toString()
      element.ticker.innerHTML = Web3SDK
        .toEther(releaseable, 'number')
        .toFixed(6)
    }, 1000)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = `/${networkName}/crew/${edition}/profile.html`
  })

  window.addEventListener('redeem-click', async e => {
    const row = await getRow()
    if (!row) notify('error', 'Invalid Cow')
    const method = 'release(address,uint256,uint256,bytes)'
    const args = [
      contract.crew.address, 
      row.edition,
      row.rates[contract.milk.address].rate,
      row.rates[contract.milk.address].proof
    ]

    //gas check
    try {
      await contract.barn.gas(Web3SDK.state.account, 0)[method](...args)
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
    //now redeem
    try {
      const confirmations = 2
      await contract.barn.write(Web3SDK.state.account, 0, {
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
           window.location.reload()
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
      })[method](...args)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('watch-click', async(e) => {
    await contract.milk.addToWallet()
  })

  //------------------------------------------------------------------//
  // Initialize
})