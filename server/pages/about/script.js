window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const goals = [
    { value: 10, image: "/images/badges/community/morgan_stanley.png" },
    { value: 50, image: "/images/badges/community/wells_fargo.png" },
    { value: 100, image: "/images/badges/community/bank_of_america.png" },
    { value: 250, image: "/images/badges/community/citi.png" },
    { value: 500, image: "/images/badges/community/jpmorgan.png" },
    { value: 1000, image: "/images/badges/community/ethereum.png" },
  ]

  const template = {
    community: document.getElementById('template-community-goal').innerHTML,
  }

  const networkName = 'ethereum'
  const network = Web3SDK.network(networkName)
  const royalty = network.contract('royalty')

  //------------------------------------------------------------------//
  // Functions
  //------------------------------------------------------------------//
  // Events

  window.addEventListener('goals-init', async (e) => {
    let unclaimed = 3.496336
    let redeemed = 2.879933
    try {
      unclaimed = parseFloat(Web3SDK.toEther(
        (await Web3SDK.web3().eth.getBalance(royalty.address)).toString(), 
        'number'
      ))
      redeemed =  parseFloat(Web3SDK.toEther(
        (await royalty.read()['totalReleased()']()).toString(),
        'number'
      ))
    } catch(e) {}
    const totalVolume = (unclaimed + redeemed) * 10

    //get unclaimed
    e.for.querySelector('span.treasury-unclaimed span.value').innerHTML = unclaimed.toFixed(6)
    //get redeemed
    e.for.querySelector('span.treasury-redeemed span.value').innerHTML = redeemed.toFixed(6)

    goals.forEach(goal => {
      const goalElement = theme.toElement(template.community, {
        '{IMAGE}': goal.image,
        '{VALUE}': goal.value,
        // '' empty string for incomplete, 'completed' for completed
        '{STATUS}': totalVolume > goal.value ? 'completed' : '',
      })

      e.for.querySelector('div.community').appendChild(goalElement)
    })
  })

  window.addEventListener('modal-open-click', async (e) => {
    theme.hide(document.querySelector(
      e.for.getAttribute('data-target')
    ), false)
  })

  window.addEventListener('modal-close-click', _ => {
    theme.hide('div.modal', true)
  })

  //------------------------------------------------------------------//
  // Initialize

  window.doon(document.body)
})