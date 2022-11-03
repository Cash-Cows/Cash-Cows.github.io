window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const edition = window.location.pathname.split('/')[3] || 0
  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    milk: network.contract('milk'),
    dolla: network.contract('dolla'),
    market: network.contract('market')
  }

  const element = {
    input: {
      milk: document.getElementById('milk'),
      dolla: document.getElementById('dolla')
    },
    balance: {
      milk: document.querySelector('div.balance-milk'),
      dolla: document.querySelector('div.balance-dolla')
    }
  }

  const exchangeRate = 10

  //------------------------------------------------------------------//
  // Functions 
  
  const getRow = async _ => {
    return await (await fetch(`/${networkName}/data/crew/${edition}.json`)).json()
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

  const write = async (contract, method, args, success, error) => {
    try {
      await contract.gas(Web3SDK.state.account, 0)[method](...args)
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
      return error(e, e.message.replace('err: i', 'I'))
    }

    try {
      const confirmations = 2
      await contract.write(Web3SDK.state.account, 0, {
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
           success()
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
      return error(e, e.message.replace('err: i', 'I'))
    }
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    const row = await getRow()
    if (!row) window.location.href = `/${networkName}/crew/${edition}/profile.html`

    const balance = {
      milk: toFixedNumber(
        Web3SDK.toEther(
          await contract.milk.read().balanceOf(Web3SDK.state.account), 'number'
        )
      ),
      dolla: toFixedNumber(
        Web3SDK.toEther(
          await contract.dolla.read().balanceOf(Web3SDK.state.account), 'number'
        )
      )
    }

    element.input.milk.setAttribute('max', balance.milk)
    element.balance.milk.innerHTML = `Balance: ${balance.milk}`
    element.balance.dolla.innerHTML = `Balance: ${balance.dolla}`
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = `/${networkName}/crew/${edition}/profile.html`
  })

  window.addEventListener('convert-keyup', async e => {
    document.getElementById('dolla').value = e.for.value * exchangeRate
    document.getElementById('dolla').setAttribute('value', e.for.value * exchangeRate)
  })

  window.addEventListener('exchange-click', async e => {
    const value = document.getElementById('milk').value
    if (!value.trim() || value == 0) {
      return notify('error', 'Invalid Value')
    }
    await write(contract.market, 'toDolla', [
      Web3SDK.toWei(value)
    ], () => {
      window.location.reload()
    }, (e, message) => {
      notify('error', message)
    })
  })

  window.addEventListener('watch-click', async (e) => {
    await network.contract(e.for.getAttribute('data-crypto')).addToWallet()
  })

  //------------------------------------------------------------------//
  // Initialize
})