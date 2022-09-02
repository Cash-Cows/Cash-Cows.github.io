window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  let database = []

  const template = {
    game: document.getElementById('template-game').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const culling = network.contract('culling')
  const metadata = network.contract('metadata')

  const messages = [
    'I thought you loved moo.',
    'Moo! Don\'t do it!',
    'Do you want Sacowfice me?',
    'I thought we had something together.',
    'I thought we would grow old together.',
    'Bitch Im a cow. Moo0ooOoove!',
    'Moo. Get rich or die trying...',
    'Buh Bye.',
    'Let\'s get rich together?',
    'Moo. I dare you.',
    'Moo! Do not press that button.',
    'Why me?!?',
    'My milkshake brings all the ETH to the barn.',
    'I have special perks in the end.',
    'What did I do wrong?',
    'I\'m heart broken.',
    'No. Your not worthy.',
    'What did I do to you?',
    'You will not receive 1 steak.',
    'Burn me later for 2 steaks...'
  ]

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

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    database = await (await fetch('/data/metadata.json')).json()
    const row = await getRow()
    if (!row) window.location.href = '/cows.html'
    const stage = parseInt(await metadata.read().stage(row.edition))

    const game = theme.toElement(template.game, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{EDITION}': row.edition,
      '{CONTRACT}': nft.address,
      '{IMAGE}': `/images/collection/${row.edition}_${stage}.png`,
      '{LEVEL}': stage + 1,
      '{MESSAGE}': messages[row.edition % messages.length] || messages[0]
    })

    document.querySelector('section.section-2 div.container').appendChild(game)
    window.doon(game)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  window.addEventListener('burn-click', async e => {
    const tokenId = parseInt(e.for.getAttribute('data-edition'))

    console.log(tokenId)

    //gas check
    try {
      await culling.gas(Web3SDK.state.account, 0).burn(tokenId)
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
      await culling.write(Web3SDK.state.account, 0, {
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
      }).burn(tokenId)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  //------------------------------------------------------------------//
  // Initialize
})