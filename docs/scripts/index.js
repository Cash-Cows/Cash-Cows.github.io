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

  const network = Web3SDK.network('ethereum')
  const royalty = network.contract('royalty')

  //------------------------------------------------------------------//
  // Events
  window.addEventListener('goals-init', async (e) => {
    const unclaimed = parseFloat(Web3SDK.toEther(
      (await Web3SDK.web3().eth.getBalance(royalty.address)).toString(), 
      'number'
    ))
    const redeemed =  parseFloat(Web3SDK.toEther(
      (await royalty.read()['totalReleased()']()).toString(),
      'number'
    ))
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

  //------------------------------------------------------------------//
  // Initialize

  let playing = false
  const player = new Audio('/media/chiptune.mp3');
  player.loop = true
  window.addEventListener('play-click', (e) => {
    if (playing) {
      player.pause()
      e.for.classList.remove('fa-pause')
      e.for.classList.add('fa-play')
    } else {
      player.play()
      e.for.classList.remove('fa-play')
      e.for.classList.add('fa-pause')
    }

    playing = !playing
  })
  window.doon(document.body)
})