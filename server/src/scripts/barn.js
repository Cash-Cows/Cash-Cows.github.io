window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const networkName = document.getElementById('network').getAttribute('data-value')
  const network = Web3SDK.network(networkName)
  const nft = network.contract('nft')
  const barn = network.contract('barn')
  const milk = network.contract('milk')
  const metadata = network.contract('metadata')

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

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    const row = await getRow()
    if (!row) window.location.href = './cows.html'
    const stage = parseInt(await metadata.read().stage(row.edition))
    await loadHead(row, stage)
    let releaseable = await (barn.read().releaseable(
      nft.address, 
      row.edition,
      row.rates[milk.address].rate
    ))
    const body = theme.toElement(template.form, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{IMAGE}': `/images/collection/${row.edition}_${stage}.png`,
      '{RATE}': Math.ceil(Web3SDK.toEther(row.rates[milk.address].rate, 'number')),
      '{RELEASEABLE}': Web3SDK.toEther(releaseable, 'number').toFixed(6)
    })
    document.querySelector('section.section-1 div.container').appendChild(body) 
    window.doon(body)

    const ticker = document.querySelector('div.releaseable span.value')
    setInterval(() => {
      releaseable = Web3SDK.toBigNumber(releaseable).add(
        Web3SDK.toBigNumber(row.rates[milk.address].rate)
      ).toString()
      ticker.innerHTML = Web3SDK.toEther(releaseable, 'number').toFixed(6)
    }, 1000)
    
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  window.addEventListener('redeem-click', async e => {
    const row = await getRow()
    if (!row) notify('error', 'Invalid Cow')
    const method = 'release(address,uint256,uint256,bytes)'
    const args = [
      nft.address, 
      row.edition,
      row.rates[milk.address].rate,
      row.rates[milk.address].proof
    ]

    //gas check
    try {
      await barn.gas(Web3SDK.state.account, 0)[method](...args)
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
      await barn.write(Web3SDK.state.account, 0, {
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
    await milk.addToWallet()
  })

  //------------------------------------------------------------------//
  // Initialize
})