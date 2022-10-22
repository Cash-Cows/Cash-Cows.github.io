window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  let database = []
  const occurances = {}

  const template = {
    game: document.getElementById('template-game').innerHTML,
    attribute: document.getElementById('template-attribute-box').innerHTML,
    loot: {
      item: document.getElementById('template-loot').innerHTML,
      modal: document.getElementById('template-loot-modal').innerHTML,
      attribute: document.getElementById('template-loot-attribute').innerHTML
    }
  }

  const networkName = document.getElementById('network').getAttribute('data-value')
  const network = Web3SDK.network(networkName)
  const nft = network.contract('nft')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')
  const game = network.contract('game')

  const treasuryTokens = {
    weth: network.contract('weth'),
    usdc: network.contract('usdc'),
    link: network.contract('link'),
    uni: network.contract('uni'),
    ape: network.contract('ape'),
    sand: network.contract('sand'),
    mana: network.contract('mana'),
    gala: network.contract('gala')
  }

  //------------------------------------------------------------------//
  // Functions 

  const getRow = async _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return database.rows.filter(row => row.edition == parseInt(params[1]))[0]
      }
    }
  }

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

  const loadLoot = async (owned) => {
    const loots = await (await fetch(`/data/${networkName}/loot.json`)).json()
    
    for (let i = 0; i < loots.length; i++) {
      const loot = loots[i]
      if (owned.indexOf(loot.edition) < 0) {
        continue
      }
      
      const item = theme.toElement(template.loot.item, {
        '{ID}': loot.edition,
        '{IMAGE}': `/images/loot/${loot.edition}.png`
      })
      document.querySelector('div.loot div.content').appendChild(item)
      window.doon(item)
    }

    theme.hide('div.loot', false)
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    database = await (await fetch('/data/metadata.json')).json()
    rarity()

    const row = await getRow()
    const loots = (await game.read().items(row.characterId))
      .map(item => parseInt(item.collectionTokenId))
    if (!row) window.location.href = '/cows.html'
    const stage = parseInt(await metadata.read().stage(row.edition))

    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      if (trait == 'Level') return
      const value = row.attributes[trait].value
      const occurance = occurances[trait][value]
      const percent = Math.floor(
        (occurance / database.rows.length) * 10000
      ) / 100
      boxes.push(template.attribute
        .replace('{NAME}', trait)
        .replace('{VALUE}', value)
        .replace('{PERCENT}', percent)
      )
    })

    const panel = theme.toElement(template.game, {
      '{COLOR}': row.attributes.Background.value.toLowerCase(),
      '{EDITION}': row.edition,
      '{RANK}': row.rank,
      '{SCORE}': row.score.toFixed(2),
      '{CONTRACT}': nft.address,
      '{IMAGE}': `/images/collection/${row.edition}_${stage}.png`,
      '{LEVEL}': stage + 1,
      '{ATTRIBUTES}': boxes.join('')
    })

    document.querySelector('section.section-2 div.container').appendChild(panel)
    window.doon(panel)

    if (loots.length) loadLoot(loots)
  })

  window.addEventListener('rewards-init', async _ => {
    const row = await getRow()
    if (!row) window.location.href = '/cows.html'
    //get total rewards
    document.querySelector('span.value-eth').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await royalty.read()['releaseable(uint256)'](row.edition),
        'number'
      )
    )

    for (const crypto in treasuryTokens) {
      document.querySelector(`span.value-${crypto}`).innerHTML = toFixedNumber(
        Web3SDK.toEther(
          await royalty.read()['releaseable(address,uint256)'](
            treasuryTokens[crypto].address,
            row.edition
          ),
          'number'
        )
      )
    }
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  window.addEventListener('redeem-click', async e => {
    const crypto = e.for.getAttribute('data-crypto')
    const tokenId = parseInt(e.for.getAttribute('data-edition'))
    const method = crypto == 'eth' ? 'release(uint256)': 'release(address,uint256)'
    const args = crypto == 'eth' ? [ tokenId ]: [
      network.contract(crypto).address, 
      tokenId 
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

  window.addEventListener('loot-modal-open-click', async (e) => {
    const id = parseInt(e.for.getAttribute('data-id'))

    const item = await (await fetch(
      `/data/${networkName}/loot/${String(id).padStart(64, '0')}.json`
    )).json()

    const boxes = []
    for (const trait of item.attributes) {
      boxes.push(template.loot.attribute
        .replace('{NAME}', trait.trait_name)
        .replace('{VALUE}', trait.value)
      )
    }

    const modal = theme.toElement(template.loot.modal, {
      '{ID}': item.edition,
      '{IMAGE}': `/images/loot/${item.edition}.png`,
      '{NAME}': item.name,
      '{ATTRIBUTES}': boxes.join('')
    })
    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  //------------------------------------------------------------------//
  // Initialize
})