window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
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

  //------------------------------------------------------------------//
  // Initialize
})