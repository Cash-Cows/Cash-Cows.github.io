window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}

  const results = document.querySelector('main.results')

  const template = {
    item: document.getElementById('template-result-item').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const metadata = network.contract('metadata')

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
    //populate cows
    Web3SDK.state.tokens = await index.read().ownerTokens(nft.address, state.account)
 
    if (!Web3SDK.state.tokens.length) {
      results.innerHTML = '<div class="alert alert-error alert-outline">You don\'t have a cow.</div>'
    }

    Web3SDK.state.tokens.forEach(async (tokenId, i) => {
      const index = tokenId - 1
      const stage = parseInt(await metadata.read().stage(tokenId))
      const row = database[index]
      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }
      const item = theme.toElement(template.item, {
        '{INDEX}': index,
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
  }

  const rarity = function() {
    database.forEach(row => {
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait]
        if (!occurances[trait]) occurances[trait] = {}
        if (!occurances[trait][value]) occurances[trait][value] = 0
        occurances[trait][value]++
        //reformat
        row.attributes[trait] = { value }
      })
    })

    //add occurance and score to each
    database.forEach(row => {
      row.score = 0
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait].value
        const occurance = occurances[trait][value]
        row.attributes[trait].occurances = occurance
        row.attributes[trait].score = 1 / (occurance / database.length)
        row.score += row.attributes[trait].score
      })
    })

    //now we need to determine each rank
    database.slice().sort((a, b) => b.score - a.score).forEach((row, i) => {
      row.rank = i + 1
    })
  }

  const disconnected = async _ => {
    delete Web3SDK.state.tokens
    results.innerHTML = ''
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('burn-click', async (e) => {
    const tokenId = parseInt(e.for.getAttribute('data-id'))
    //gas check
    try {
      await nft.gas(Web3SDK.state.account, 0).burn(tokenId)
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
    //now burn
    try {
      await nft.write(Web3SDK.state.account, 0, 2).burn(tokenId)
      e.for.parentNode.removeChild(e.for)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  //------------------------------------------------------------------//
  // Initialize

  //count occurances
  rarity()

  //start session
  network.startSession(connected, disconnected, true)
})