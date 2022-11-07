window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  //------------------------------------------------------------------//
  // Functions 

  const getEdition = _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return params[1]
      }
    }
  }

  //------------------------------------------------------------------//
  // Events
  //------------------------------------------------------------------//
  // Initialize

  const edition = getEdition()
  if (typeof edition === 'undefined') {
    window.location.href = `/ethereum/crew/`
    return
  }

  window.location.href = `/ethereum/crew/${edition}/profile.html`
})