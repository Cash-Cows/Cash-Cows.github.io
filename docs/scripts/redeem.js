window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables

  const attributes = {}

  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}
  //count occurances
  database.forEach((row, i) => {
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
      if (!occurances[trait]) occurances[trait] = {}
      if (!occurances[trait][value]) occurances[trait][value] = 0
      occurances[trait][value]++
    })
  })

  const results = document.querySelector('main.results')

  const template = {
    item: document.getElementById('template-result-item').innerHTML,
    modal: document.getElementById('template-modal').innerHTML,
    attribute: document.getElementById('template-attribute-box').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const metadata = network.contract('metadata')

  //------------------------------------------------------------------//
  // Functions

  const connected = async state => {
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
  }

  const disconnected = async _ => {
    delete Web3SDK.state.tokens
    results.innerHTML = ''
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('modal-open-click', (e) => {
    const level = parseInt(e.for.getAttribute('data-level'))
    const index = parseInt(e.for.getAttribute('data-index'))
    const row = database[index]
    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
      const occurance = occurances[trait][value]
      const percent = Math.floor((occurance / database.length) * 10000) / 100
      boxes.push(template.attribute
        .replace('{NAME}', trait)
        .replace('{VALUE}', value)
        .replace('{PERCENT}', percent)
      )
    })

    const modal = theme.toElement(template.modal, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{NAME}': `#${row.edition}`,
      '{IMAGE}': `/images/collection/${row.edition}_${level - 1}.png`,
      '{ATTRIBUTES}': boxes.join('')
    })

    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', (e) => {
    document.body.removeChild(e.for)
  })

  //------------------------------------------------------------------//
  // Initialize

  network.startSession(connected, disconnected, true)
})