window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables

  const community = document.querySelector('section.section-1 div.community')
  const holder = document.querySelector('section.section-2 div.assets')
  const wealth = document.querySelector('section.section-2 div.net-worth')

  const template = {
    community: document.getElementById('template-community-goal').innerHTML,
    holder: document.getElementById('template-individual-holder').innerHTML,
    wealth: document.getElementById('template-individual-wealth').innerHTML,
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

  const communityGoals = [
    { value: 10, image: "/images/badges/community/morgan_stanley.png" },
    { value: 50, image: "/images/badges/community/wells_fargo.png" },
    { value: 100, image: "/images/badges/community/bank_of_america.png" },
    { value: 250, image: "/images/badges/community/citi.png" },
    { value: 500, image: "/images/badges/community/jpmorgan.png" },
    { value: 1000, image: "/images/badges/community/ethereum.png" },
  ]

  const holderGoals = [
    { name: "Cowboy", count: 1, image: "/images/badges/individual/cowboy.png" },
    { name: "Wrangler", count: 3, image: "/images/badges/individual/wrangler.png" },
    { name: "Cow Herder", count: 5, image: "/images/badges/individual/herder.png" },
    { name: "Cow Breeder", count: 10, image: "/images/badges/individual/breeder.png" },
    { name: "Cow Mogul", count: 20, image: "/images/badges/individual/mogul.png" },
    { name: "Cow Tycoon", count: 50, image: "/images/badges/individual/tycoon.png" },
    { name: "Serial Cowpreneur", count: 100, image: "/images/badges/individual/cowpreneur.png" },
  ]

  const wealthGoals = [
    { name: "Minimum Wage", value: 0.01, image: "/images/badges/redeemable/minimum_wage.png" },
    { name: "Savings Account", value: 0.05, image: "/images/badges/redeemable/savings.png" },
    { name: "Money Bags", value: 0.10, image: "/images/badges/redeemable/money_bags.png" },
    { name: "Money Vault", value: 0.20, image: "/images/badges/redeemable/money_vault.png" },
    { name: "50 Cent", value: 0.50, image: "/images/badges/redeemable/50_cent.png" },
    { name: "chuck_norris", value: 1.00, image: "/images/badges/redeemable/chuck_norris.png" }
  ]

  const totalVolume = 45.7

  //------------------------------------------------------------------//
  // Functions 
  const populateCommunity = () => {
    communityGoals.forEach(goal => {
      const goalElement = theme.toElement(template.community, {
        '{IMAGE}': goal.image,
        '{VALUE}': goal.value,
        // '' empty string for incomplete, 'completed' for completed
        '{STATUS}': totalVolume > goal.value ? 'completed' : ''
      })

      community.appendChild(goalElement)
    })
  }

  const populateHolder = (userCowCount) => {
    holderGoals.forEach(badge => {
      const badgeElement = theme.toElement(template.holder, {
        '{IMAGE}': badge.image,
        '{COUNT}': badge.count,
        '{NAME}': badge.name,
        '{STATUS}': userCowCount >= badge.count ? 'active' : ''
      })

      holder.appendChild(badgeElement)
    })
  }

  const populateWealth = (userTotalRedeemable) => {
    wealthGoals.forEach(badge => {
      const badgeElement = theme.toElement(template.wealth, {
        '{IMAGE}': badge.image,
        '{VALUE}': badge.value.toFixed(2),
        '{NAME}': badge.name,
        '{STATUS}': userTotalRedeemable >= badge.value ? 'active' : ''
      })

      wealth.appendChild(badgeElement)
    })
  }

  const connected = async state => {
    holder.innerHTML = ''
    wealth.innerHTML = ''

    Web3SDK.state.tokens = await index.read().ownerTokens(
      nft.address, 
      state.account,
      4030
    )  

    //get total rewards
    const redeemable = Web3SDK.toEther(
      await royalty.read()['releaseableBatch(uint256[])'](Web3SDK.state.tokens),
      'number'
    ).toFixed(6)

    populateHolder(Web3SDK.state.tokens.length)
    populateWealth(redeemable)
  }

  const disconnected = async _ => {
    delete Web3.state.tokens
    const individual = document.querySelector('section.section-2 div.individual')
    individual.innerHTML = ''
    holder.innerHTML = ''
    wealth.innerHTML = ''
  }

  //------------------------------------------------------------------//
  // Event

  //------------------------------------------------------------------//
  // Initialize

  populateCommunity()

  //start session  
  window.ethereum.on("accountsChanged", async (accounts) => {  
    network.startSession(connected, disconnected, true)
  });
  window.ethereum.on("chainChanged", async () => { 
    network.startSession(connected, disconnected, true)
  });
  window.ethereum.on("close", (error) => { 
      console.log("Errorethereum",error);
  });
  network.startSession(connected, disconnected, true)
});
