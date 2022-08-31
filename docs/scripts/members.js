window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  //------------------------------------------------------------------//
  // Functions 
  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    window.location.href = '/trophies.html'
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  //------------------------------------------------------------------//
  // Initialize
})