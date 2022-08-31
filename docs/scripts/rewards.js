window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const milk = network.contract('milk')
  const dolla = network.contract('milk')
  const culling = network.contract('culling')

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

  const watchable = Object.assign({}, treasuryTokens, { milk, dolla })

  //------------------------------------------------------------------//
  // Functions 
  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    Web3SDK.state.tokens = await index.read().ownerTokens(
      nft.address, 
      Web3SDK.state.account,
      4030
    )
    //get total rewards
    document.querySelector('span.value-eth').innerHTML = Web3SDK.toEther(
      await royalty.read()['releaseableBatch(uint256[])'](Web3SDK.state.tokens),
      'number'
    ).toFixed(6)

    for (const crypto in treasuryTokens) {
      document.querySelector(`span.value-${crypto}`).innerHTML = Web3SDK.toEther(
        await royalty.read()['releaseableBatch(address,uint256[])'](
          treasuryTokens[crypto].address,
          Web3SDK.state.tokens
        ),
        'number'
      ).toFixed(6)
    }

    document.querySelector('span.value-milk').innerHTML = Web3SDK.toEther(
      await milk.read().balanceOf(Web3SDK.state.account), 'number'
    ).toFixed(6)

    document.querySelector('span.value-dolla').innerHTML = Web3SDK.toEther(
      await dolla.read().balanceOf(Web3SDK.state.account), 'number'
    ).toFixed(6)

    document.querySelector('span.value-steak').innerHTML = parseFloat(
      await culling.read().balanceOf(Web3SDK.state.account)
    ).toFixed(0)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = '/members.html'
  })

  window.addEventListener('watch-click', async(e) => {
    await watchable[e.for.getAttribute('data-crypto')].addToWallet()
  })

  //------------------------------------------------------------------//
  // Initialize
})