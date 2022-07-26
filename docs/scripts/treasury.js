window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}

  const unclaimed = document.querySelector('span.treasury-unclaimed span.value')
  const redeemed = document.querySelector('span.treasury-redeemed span.value')
  const rewards = document.querySelector('span.total-rewards span.value')
  const results = document.querySelector('main.results')

  const template = {
    item: document.getElementById('template-result-item').innerHTML,
    modal: document.getElementById('template-modal').innerHTML,
    attribute: document.getElementById('template-attribute-box').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
    //populate cows
    Web3SDK.state.tokens = await nft.read().ownerTokens(state.account)
    Web3SDK.state.tokens.forEach(async tokenId => {
      const index = tokenId - 1
      const stage = parseInt(await metadata.read().stage(tokenId))
      const item = theme.toElement(template.item, {
        '{INDEX}': index,
        '{NAME}': `#${tokenId}`,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `/images/collection/${tokenId}_${stage}.png`
      })
      results.appendChild(item)
      window.doon(item)
    })

    //get total rewards
    let unclaimed = 0
    for (const tokenId of Web3SDK.state.tokens) {
      unclaimed += Web3SDK.toEther(
        await royalty.read()['releaseable(uint256)'](tokenId),
        'number'
      )
    }

    rewards.innerHTML = unclaimed.toFixed(6)
  }

  const disconnected = async _ => {
    delete Web3SDK.state.tokens
    results.innerHTML = ''
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('modal-open-click', async (e) => {
    const level = parseInt(e.for.getAttribute('data-level'))
    const index = parseInt(e.for.getAttribute('data-index'))
    const row = database[index]
    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
      const occurance = occurances[trait][value]
      const percent = Math.floor(
        (occurance / database.length) * 10000
      ) / 100
      boxes.push(template.attribute
        .replace('{NAME}', trait)
        .replace('{VALUE}', value)
        .replace('{PERCENT}', percent)
      )
    })

    const releaseable = parseInt(
      await royalty.read()['releaseable(uint256)'](row.edition)
    )
    const modal = theme.toElement(template.modal, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{ID}': row.edition,
      '{CONTRACT}': nft.address,
      '{IMAGE}': `/images/collection/${row.edition}_${level - 1}.png`,
      '{REWARDS}': parseFloat(
        Web3SDK.toEther(releaseable, 'number') || '0.00'
      ).toFixed(5),
      '{LEVEL}': level,
      '{ATTRIBUTES}': boxes.join('')
    })

    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  window.addEventListener('redeem-click', async (e) => {
    const tokenId = parseInt(e.for.getAttribute('data-id'))
    //gas check
    try {
      await royalty.gas(Web3SDK.state.account, 0)['release(uint256)'](tokenId)
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
      await royalty.write(Web3SDK.state.account, 0, {
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
      })['release(uint256)'](tokenId)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('redeem-all-click', async () => {
    if (!Web3SDK.state.tokens?.length) {
      return notify('error', 'No cows holding.')
    }
    //gas check
    try {
      await royalty.gas(Web3SDK.state.account, 0)['releaseBatch(uint256[])'](Web3SDK.state.tokens)
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
      await royalty.write(Web3SDK.state.account, 0, {
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
      })['releaseBatch(uint256[])'](Web3SDK.state.tokens)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  //------------------------------------------------------------------//
  // Initialize

  //count occurances
  database.forEach((row, i) => {
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
      if (!occurances[trait]) occurances[trait] = {}
      if (!occurances[trait][value]) occurances[trait][value] = 0
      occurances[trait][value]++
    })
  })

  //get unclaimed
  unclaimed.innerHTML = parseFloat(Web3SDK.toEther(
    (await Web3SDK.web3().eth.getBalance(royalty.address)).toString(), 
    'number'
  ) || '0.00').toFixed(6)
  //get redeemed
  redeemed.innerHTML = parseFloat(Web3SDK.toEther(
    (await royalty.read()['totalReleased()']()).toString(),
    'number'
  ) || '0.00').toFixed(6)

  //start session
  network.startSession(connected, disconnected, true)
})