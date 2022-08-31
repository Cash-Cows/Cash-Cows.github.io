window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const network = Web3SDK.network('ethereum')

  //------------------------------------------------------------------//
  // Functions 

  const connected = async _ => {}

  const disconnected = async _ => {
    window.location.href = '/members.html'
  }

  //------------------------------------------------------------------//
  // Events
  //------------------------------------------------------------------//
  // Initialize

  //start session
  network.startSession(connected, disconnected, true)
})