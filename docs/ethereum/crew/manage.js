window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  //sets up the Web3 SDK
  const networkName = window.location.pathname.split('/')[1]
  const network = Web3SDK.network(networkName)
  const contract = {
    crew: network.contract('crew'),
    barn: network.contract('barn'),
    milk: network.contract('milk'),
    index: network.contract('index'),
    royalty: network.contract('royalty'),
    metadata: network.contract('metadata')
  }

  const template = {
    crew: document.getElementById('template-crew').innerHTML
  }

  const element = {
    cows: document.querySelector('section.section-crews div.crews'),
    redeem: document.querySelector('footer.redeem-bar div.form div.center')
  }

  const cache = { milk: {}, rows: {} };

  let crypto = ''
  const selectedCows = {}
  let all = false

  //------------------------------------------------------------------//
  // Functions 

  const redeemText = async function(tokenId, selected) {
    const totalCows = Object.keys(selectedCows).length
    if (tokenId) {
      if (!cache.milk[tokenId]) {
        if (!cache.rows[tokenId]) {
          cache.rows[tokenId] = await (
            await fetch(`/${networkName}/data/crew/${tokenId}.json`)
          ).json()
        }
        
        cache.milk[tokenId] = {
          rate: cache.rows[tokenId].rates[contract.milk.address].rate,
          proof: cache.rows[tokenId].rates[contract.milk.address].proof,
          releaseable: await contract.barn.read().releaseable(
            contract.crew.address,
            tokenId,
            cache.rows[tokenId].rates[contract.milk.address].rate
          ),
          active: true
        }
      }
      cache.milk[tokenId].active = selected
    }
    
    //if there's no cows
    if (!totalCows) {
      element.redeem.innerHTML = ''
      return
    } 
    //there's cows
    //if no crypto selected
    if (!crypto.length) {
      if (totalCows == 1) {
        element.redeem.innerHTML = '1 Cow'
        return
      }

      element.redeem.innerHTML = `${totalCows} Cows`
      return
    }

    //there's cows 
    //crypto was selected
    const tokens = Object.keys(selectedCows).map(index => index)

    let releaseable
    if (crypto == 'eth') {
      releaseable = await (contract.royalty.read()['releaseableBatch(uint256[])'](tokens))
    } else if (crypto == 'milk') {
      releaseable = Web3SDK.toBigNumber('0')
      for (const tokenId in cache.milk) {
        if (!cache.milk[tokenId].active) continue
        releaseable = releaseable.add(
          Web3SDK.toBigNumber(cache.milk[tokenId].releaseable)
        )
      }
    } else {
      releaseable = await (contract.royalty.read()['releaseableBatch(address,uint256[])'](
        network.contract(crypto).address,
        tokens
      ))
    }

    if (totalCows == 1) {
      element.redeem.innerHTML = `${
        parseFloat(Web3SDK.toEther(releaseable)).toFixed(6)
      } ${crypto.toUpperCase()} from 1 Cow`
      return
    }

    element.redeem.innerHTML = `${
      parseFloat(Web3SDK.toEther(releaseable)).toFixed(6)
    } ${crypto.toUpperCase()} from ${totalCows} Cows`
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
    Web3SDK.state.owned.crew.forEach(async tokenId => {
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

      const stage = row.attributes.Level.value

      const item = theme.toElement(template.crew, {
        '{EDITION}': row.edition,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{LEVEL}': stage,
        '{IMAGE}': `https://cdn.cashcows.club/crew/preview/${tokenId}_${stage - 1}.png`
      })

      element.cows.appendChild(item)
      window.doon(item)
    })
  })

  window.addEventListener('web3sdk-disconnected', async _ => {})

  window.addEventListener('crypto-select-change', async e => {
    crypto = e.for.value
    if (e.for.value === 'cancel') {
      e.for.value = ''
      crypto = ''

      theme.toggle(document.body, 'selecting')
      theme.toggle(document.body, 'redeeming')
      theme.hide(e.for.parentNode, true)
      theme.toggle(e.for.parentNode.parentNode, 'active')
      theme.hide(e.for.parentNode.parentNode.querySelector('a.redeem-toggle'), false)
    }

    redeemText()
  })

  window.addEventListener('cow-select-click', async e => {
    theme.toggle(e.for, 'selected')
    const edition = e.for.getAttribute('data-edition')
    if (!selectedCows[edition]) {
      selectedCows[edition] = true
    } else {
      delete selectedCows[edition]
    }

    redeemText(edition, selectedCows[edition] || false)
  })

  window.addEventListener('toggle-all-click', async e => {
    all = !all
    Array.from(document.querySelectorAll('div.crews div.crew')).forEach(item => {
      if (item.classList.contains('selected') && !all) {
        item.click()
      } else if (!item.classList.contains('selected') && all) {
        item.click()
      }
    })
  })

  window.addEventListener('redeem-selected-click', async () => {
    if (!crypto.length) {
      return notify('error', 'No crypto was chosen')
    }
    const selected = Object.keys(selectedCows);
    if (selected.length <= 0) {
      return notify('error', 'No cows selected')
    }

    if (crypto == 'milk') {
      const tokenIds = []
      const rates = []
      const proofs = []
      for (const tokenId in cache.milk) {
        if (!cache.milk[tokenId].active) continue
        tokenIds.push(parseInt(tokenId))
        rates.push(parseInt(cache.milk[tokenId].rate))
        proofs.push(cache.milk[tokenId].proof.toString())
      }

      const rpc = contract.barn.resource.methods[
        'release(address,uint256[],uint256[],bytes[])'
      ](...[
        contract.crew.address,
        tokenIds,
        rates,
        proofs
      ]).send({ to: contract.barn.address, from: Web3SDK.state.account })

      //listen to observers
      rpc.on('transactionHash', function(hash) {
        notify(
         'success', 
         `Transaction started on <a href="${
          network.config.chain_scanner
        }/tx/${hash}" target="_blank">${
          network.config.chain_scanner
        }</a>. Please stay on this page and wait for 2 confirmations...`,
          1000000
        )
      });

      rpc.on('confirmation', function(confirmationNumber, receipt) {
        if (confirmationNumber > 2) return
        if (confirmationNumber == 2) return window.location.reload()
        notify(
          'success', 
          `${confirmationNumber}/2 confirmed on <a href="${
            network.config.chain_scanner
          }/tx/${receipt.transactionHash}" target="_blank">${
            self.network.config.chain_scanner
          }</a>. Please stay on this page and wait for 2 confirmations...`, 
          1000000
        )
      });

      rpc.on('receipt', function(receipt) {
        notify(
          'success', 
          `Confirming on <a href="${self.network.config.chain_scanner}/tx/${
            receipt.transactionHash
          }" target="_blank">${
            self.network.config.chain_scanner
          }</a>. Please stay on this page and wait for 2 confirmations...`,
          1000000
        )
      });

      try {
        await rpc
      } catch(e) {
        console.error(e)
        notify('error', e.message || e)
      }
    } else if (crypto == 'eth') {
      write(contract.royalty, 'releaseBatch(uint256[])', [ 
        selected 
      ], _ => {
        window.location.reload()
      }, e => {
        notify('error', e.message || e)
      })
    } else {
      write(contract.royalty, 'releaseBatch(address,uint256[])', [
        network.contract(crypto).address, 
        selected 
      ], _ => {
        window.location.reload()
      }, e => {
        notify('error', e.message || e)
      })
    }

    
  })

  //------------------------------------------------------------------//
  // Initialize
})