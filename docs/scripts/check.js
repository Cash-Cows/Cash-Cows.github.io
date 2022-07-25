(async (window) => {

  //------------------------------------------------------------------//
  // Variables

  //------------------------------------------------------------------//
  // Functions

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('check-click', () => {
    const address = document.querySelector('input.wallet-address').value
    if (checklist[address.toLowerCase()]) {
      notify('success', 'You are on the Whitelist')
    } else {
      notify('error', 'You are on not the Whitelist')
    }
  })

  //------------------------------------------------------------------//
  // Initialize
  const response = await fetch('/data/authorized.json')
  const checklist = await response.json()
})(window)