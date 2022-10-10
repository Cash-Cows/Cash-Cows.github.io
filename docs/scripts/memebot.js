window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const network = Web3SDK.network('ethereum')
  const meme = network.contract('meme')

  //------------------------------------------------------------------//
  // Functions 
  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {})

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  window.addEventListener('verify-click',  async _ => {
    const web3 = Web3SDK.web3()
    //make a message
    const message = web3.utils.sha3([
      web3.utils.toHex('cashcowsmoo')
    ].join(''), { encoding: 'hex' }).slice(2);
    //sign a message
    let signed
    try {
      signed = await ethereum.request({ 
        method: 'personal_sign', 
        params: [ message, Web3SDK.state.account ] 
      });
    } catch(e) {
      return notify('error', e.message || e)
    }

    document.getElementById('proof').innerHTML = signed
    theme.hide('div.results', false)
  })

  window.addEventListener('load-click', async e => {
    const amount = document.getElementById('milk').value
    if (!amount.length) return notify('error', 'No milk specified.')
    //gas check
    try {
      await meme.gas(Web3SDK.state.account, 0).load(
        Web3SDK.state.account,
        Web3SDK.toWei(amount, 'string')
      )
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
      await meme.write(Web3SDK.state.account, 0, {
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
      }).load(
        Web3SDK.state.account,
        Web3SDK.toWei(amount, 'string')
      )
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  //------------------------------------------------------------------//
  // Initialize
})