window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    loot: network.contract('loot'),
    game: network.contract('game'),
    dolla: network.contract('dolla')
  }

  const template = {
    nft: document.getElementById('template-nft').innerHTML,
    loot: document.getElementById('template-loot').innerHTML
  }

  const element = {
    nfts: document.querySelector('section.section-nfts div.nfts'),
    loots: document.querySelector('section.section-loots div.loots')
  }

  //------------------------------------------------------------------//
  // Functions 

  const loadNFTs = async (address, next) => {
    const params = new URLSearchParams()
    params.set('sortBy', 'acquiredAt')
    params.set('sortDirection', 'desc')
    params.set('offset', '0')
    params.set('limit', '100')
    const response = await fetch(
      `https://api.cashcows.club/reservoir/users/${address}/tokens/v5?${params.toString()}`
    )
    const json = await response.json()
    if (json.error) return notify('error', json.message)
    json.results.tokens.forEach(row => {
      if (!row.token.name || !row.token.image) return
      const nft = theme.toElement(template.nft, {
        '{ADDRESS}': row.token.contract,
        '{TOKEN}': row.token.tokenId,
        '{NAME}': row.token.name,
        '{IMAGE}': row.token.image
      })

      element.nfts.appendChild(nft)
      window.doon(nft)
    })

    return json.results.next
  }

  const loadAllNFTs = async (address) => {
    let next = null
    do {
      next = await loadNFTs(address, next)
    } while (!!next)
  }



  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    await loadAllNFTs(Web3SDK.state.account)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  //------------------------------------------------------------------//
  // Initialize
})