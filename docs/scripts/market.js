window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const networkName = document.getElementById('network').getAttribute('data-value')
  const network = Web3SDK.network(networkName)
  const milk = network.contract('milk')
  const dolla = network.contract('dolla')
  const market = network.contract('market')
  const metadata = network.contract('metadata')

  const exchangeRate = 10

  const template = {
    form: document.getElementById('template-form').innerHTML
  }

  //------------------------------------------------------------------//
  // Functions 
  
  const getRow = async _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return await (await fetch(`/data/${networkName}/crew/${params[1]}.json`)).json()
      }
    }
  }

  const loadHead = async (row, stage) => {
    const head = document.querySelector('header.head a.cow')
    head.setAttribute('href', `./deets.html?edition=${row.edition}`)
    head.innerHTML = `<img src="/images/collection/${row.edition}_${stage}.png" />`
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
    if (!row) window.location.href = './cows.html'

    const stage = parseInt(await metadata.read().stage(row.edition))
    await loadHead(row, stage)
    const body = theme.toElement(template.form, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{IMAGE}': `/images/collection/${row.edition}_${stage}.png`,
      '{MILK}': toFixedNumber(
        Web3SDK.toEther(
          await milk.read().balanceOf(Web3SDK.state.account), 'number'
        )
      ),
      '{DOLLA}': toFixedNumber(
        Web3SDK.toEther(
          await dolla.read().balanceOf(Web3SDK.state.account), 'number'
        )
      )
    })
    document.querySelector('section.section-1 div.container').appendChild(body) 
    window.doon(body)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  window.addEventListener('convert-keyup', async e => {
    document.getElementById('dolla').value = e.for.value * exchangeRate
    document.getElementById('dolla').setAttribute('value', e.for.value * exchangeRate)
  })

  window.addEventListener('exchange-click', async e => {
    await write(market, 'toDolla', [
      Web3SDK.toWei(document.getElementById('milk').value)
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