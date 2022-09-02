window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}

  const results = document.querySelector('div.cows')

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

  const template = {
    item: document.getElementById('template-result-item').innerHTML
  }

  let crypto = ''
  const selectedCows = {}
  let all = false

  //------------------------------------------------------------------//
  // Functions 

  const rarity = function() {
    //remove burned
    database.rows = database.rows.filter(row => row.attributes.Level > 0)
    //add indexes
    database.rows.forEach((row, i) => (row.index = i))
    //count occurances
    database.rows.forEach(row => {
      Object.keys(row.attributes).forEach(trait => {
        const value = String(row.attributes[trait])
        if (!occurances[trait]) occurances[trait] = {}
        if (!occurances[trait][value]) occurances[trait][value] = 0
        if (row.attributes.Level > 0) occurances[trait][value]++
        //reformat
        row.attributes[trait] = { value }
      })
    })
    //add occurance and score to each
    database.rows.forEach(row => {
      row.score = 0
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait].value
        const occurance = occurances[trait][value]
        row.attributes[trait].occurances = occurance
        row.attributes[trait].score = 1 / (occurance / database.rows.length)
        row.score += row.attributes[trait].score
      })

      row.score += row.attributes.Level.value * 1000
    })
    //now we need to determine each rank
    let rank = 1
    const ranked = database.rows.slice().sort((a, b) => b.score - a.score)
    ranked.forEach((row, i) => {
      row.rank = i == 0 
        || Math.floor(ranked[i - 1].score * 100) == Math.floor(row.score * 100) 
        ? rank
        : ++rank
    })
  }

  const redeemText = async function() {
    const redeemText = document.querySelector('footer.redeem-bar div.form div.center')
    const totalCows = Object.keys(selectedCows).length
    //if there's no cows
    if (!totalCows) {
      redeemText.innerHTML = ''
      return
    } 
    //there's cows
    //if no crypto selected
    if (!crypto.length) {
      if (totalCows == 1) {
        redeemText.innerHTML = '1 Cow'
        return
      }

      redeemText.innerHTML = `${totalCows} Cows`
      return
    }

    //there's cows 
    //crypto was selected
    const tokens = Object.keys(selectedCows).map(index => index)

    let releaseable
    if (crypto == 'eth') {
      releaseable = await (royalty.read()['releaseableBatch(uint256[])'](tokens))
    } else {
      releaseable = await (royalty.read()['releaseableBatch(address,uint256[])'](
        network.contract(crypto).address,
        tokens
      ))
    }

    if (totalCows == 1) {
      redeemText.innerHTML = `${
        parseFloat(Web3SDK.toEther(releaseable)).toFixed(6)
      } ${crypto.toUpperCase()} from 1 Cow`
      return
    }

    redeemText.innerHTML = `${
      parseFloat(Web3SDK.toEther(releaseable)).toFixed(6)
    } ${crypto.toUpperCase()} from ${totalCows} Cows`
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    console.log('connected')
    Web3SDK.state.tokens = await index.read().ownerTokens(
      nft.address, 
      Web3SDK.state.account,
      4030
    )

    if (!Web3SDK.state.tokens.length) {
      document.querySelector('section.section-2 div.container').prepend(theme.toElement(
        '<div class="alert alert-outline alert-secondary">Don\'t have a '
        + 'cow? Get some <a href="https://opensea.io/collection/cash-cows-crew" '
        + 'target="_blank">@OpenSea</a>!</div>'
      ))

      theme.hide('footer.redeem-bar', true)
    }

    results.innerHTML = ""; 
    Web3SDK.state.tokens.forEach(async (tokenId, i) => {
      const stage = parseInt(await metadata.read().stage(tokenId))
      const row = database.rows.filter(row => row.edition == tokenId)[0]

      if (!row) return

      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }
      const item = theme.toElement(template.item, {
        '{INDEX}': row.index,
        '{EDITION}': row.edition,
        '{NAME}': `#${tokenId}`,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{SCORE}': row.score,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `/images/collection/${tokenId}_${stage}.png`,
        '{CHECKVALUE}': tokenId,
        '{ISCHECKED}': i < 10 ? 'checked': ''
      })

      results.appendChild(item)
      window.doon(item)
    })
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = '/members.html'
  })

  window.addEventListener('redeem-toggle-click', async e => {
    theme.toggle(document.body, 'selecting')
    theme.toggle(document.body, 'redeeming')
    theme.hide(e.for, true)
    theme.toggle(e.for.parentNode, 'active')
    theme.hide(e.for.parentNode.querySelector('div.form'), false)
  })

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
    if (document.body.classList.contains('selecting')) {
      window.location.href = `/deets.html?edition=${e.for.getAttribute('data-edition')}`
    } else if (document.body.classList.contains('redeeming')) {
      theme.toggle(e.for, 'selected')
      const edition = e.for.getAttribute('data-edition')
      if (!selectedCows[edition]) {
        selectedCows[edition] = true
      } else {
        delete selectedCows[edition]
      }
    }

    redeemText()
  })

  window.addEventListener('toggle-all-click', async e => {
    all = !all
    Array.from(document.querySelectorAll('div.cows div.item')).forEach(item => {
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

    const method = crypto == 'eth' ? 'releaseBatch(uint256[])': 'releaseBatch(address,uint256[])'
    const args = crypto == 'eth' ? [ selected ]: [
      network.contract(crypto).address, 
      selected 
    ]

    //gas check
    try {
      await royalty.gas(Web3SDK.state.account, 0)[method](...args)
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
      })[method](...args)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  //------------------------------------------------------------------//
  // Initialize

  console.log('loaded')

  //count occurances
  rarity()
})

console.log('moo')