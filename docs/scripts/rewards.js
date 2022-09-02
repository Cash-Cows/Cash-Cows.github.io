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

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
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
    }
    //get total rewards
    document.querySelector('span.value-eth').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await royalty.read()['releaseableBatch(uint256[])'](Web3SDK.state.tokens),
        'number'
      )
    )

    for (const crypto in treasuryTokens) {
      document.querySelector(`span.value-${crypto}`).innerHTML = toFixedNumber(
        Web3SDK.toEther(
          await royalty.read()['releaseableBatch(address,uint256[])'](
            treasuryTokens[crypto].address,
            Web3SDK.state.tokens
          ),
          'number'
        )
      )
    }

    document.querySelector('span.value-milk').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await milk.read().balanceOf(Web3SDK.state.account), 'number'
      )
    )

    document.querySelector('span.value-dolla').innerHTML = 0;toFixedNumber(
      Web3SDK.toEther(
        await dolla.read().balanceOf(Web3SDK.state.account), 'number'
      )
    )

    document.querySelector('span.value-steak').innerHTML = parseFloat(
      await culling.read().balanceOf(Web3SDK.state.account)
    ).toFixed(0)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  window.addEventListener('watch-click', async(e) => {
    await watchable[e.for.getAttribute('data-crypto')].addToWallet()
  })

  //------------------------------------------------------------------//
  // Initialize
})