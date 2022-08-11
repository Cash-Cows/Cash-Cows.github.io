window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables

  const community = document.querySelector('section.section-1 div.community')
  const holder = document.querySelector('section.section-2 div.assets')
  const wealth = document.querySelector('section.section-2 div.net-worth')
  const burned = document.querySelector('section.section-2 div.culling')
  const searchbox = document.querySelector('section.section-2 div.searchbox')
  const searchInput = document.querySelector('section.section-2 div.searchbox input.searchbox-input')

  const template = {
    community: document.getElementById('template-community-goal').innerHTML,
    individual: document.getElementById('template-individual').innerHTML,
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const culling = network.contract('culling')

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
    { name: "Rancher", count: 3, image: "/images/badges/individual/rancher.png" },
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
    { name: "Chuck Norris", value: 1.00, image: "/images/badges/redeemable/chuck_norris.png" }
  ]

  const burnedGoals = [
    { name: "Beef Cubes", count: 4, image: "/images/badges/culling/beef_cubes.png" },
    { name: "Beef Jerky", count: 8, image: "/images/badges/culling/beef_jerky.png" },
    { name: "Burger Steak", count: 16, image: "/images/badges/culling/burger_steak.png" },
    { name: "Well Done", count: 32, image: "/images/badges/culling/well_done.png" },
    { name: "Momma's Ribs", count: 64, image: "/images/badges/culling/mommas_ribs.png" },
    { name: "Cookout", count: 128, image: "/images/badges/culling/cookout.png" },
  ]

  let toggledSearch = false;
  const totalVolume = 46.6

  //------------------------------------------------------------------//
  // Functions 
  const populateCommunity = () => {
    communityGoals.forEach(goal => {
      const goalElement = theme.toElement(template.community, {
        '{IMAGE}': goal.image,
        '{VALUE}': goal.value,
        // '' empty string for incomplete, 'completed' for completed
        '{STATUS}': totalVolume > goal.value ? 'completed' : '',
      })

      community.appendChild(goalElement)
    })
  }

  const populateHolder = (userCowCount) => {
    holderGoals.forEach(badge => {
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} x Cow Holder`,
        '{NAME}': badge.name,
        '{STATUS}': userCowCount >= badge.count ? 'active' : ''
      })
      holder.appendChild(badgeElement)
    })
  }

  const populateWealth = (userTotalRedeemable) => {
    wealthGoals.forEach(badge => {
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.value.toFixed(2)} Redeemable`,
        '{NAME}': badge.name,
        '{STATUS}': userTotalRedeemable >= badge.value ? 'active' : ''
      })

      wealth.appendChild(badgeElement)
    })
  }

  const populateCulling = (userCulledCount) => {
    burnedGoals.forEach(badge => {
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} Cows Burned`,
        '{NAME}': badge.name,
        '{STATUS}': userCulledCount >= badge.count ? 'active' : ''
      })

      burned.appendChild(badgeElement)
    })
  }

  const individualReset = () => {
    holder.innerHTML = ''
    wealth.innerHTML = ''
    burned.innerHTML = ''
  }

  const populate = async () => {
    let account;
    let tokens;

    if (toggledSearch) {
      account = searchInput.value;
      try {
        tokens = await index.read().ownerTokens(
          nft.address, 
          account,
          4030
        )  
      } catch (_) {
        notify('error', "Invalid Address")
        return
      }
    } else {
      if (!Web3SDK.state) return;
      account = Web3SDK.state.account,
      tokens = await index.read().ownerTokens(
        nft.address, 
        account,
        4030
      )  
    }

    //get total rewards
    const redeemable = Web3SDK.toEther(
      await royalty.read()['releaseableBatch(uint256[])'](tokens),
      'number'
    ).toFixed(6)

    // get total culled
    const culled = parseFloat(
      await culling.read().balanceOf(account)
    ).toFixed(0)

    populateHolder(tokens.length)
    populateWealth(redeemable)
    populateCulling(culled);
  }

  const connected = async _ => {
    individualReset()
    populate()
  }

  const disconnected = async _ => {
    delete Web3.state.tokens
    const individualHolder = document.querySelector('section.section-2 div.individual')
    individualHolder.innerHTML = ''

    individualReset()
  }

  //------------------------------------------------------------------//
  // Events
  window.addEventListener('toggle-search-click', () => {
    toggledSearch = !toggledSearch;

    individualReset();

    if (toggledSearch) {
      searchbox.classList.add('show-search');
    } else {
      searchbox.classList.remove('show-search');
      populate()
    }
  })

  window.addEventListener('search-user-click', () => {
    individualReset()
    populate()
  })

  //------------------------------------------------------------------//
  // Initialize
  populateCommunity()

  //start session
  network.startSession(connected, disconnected, true)
});
