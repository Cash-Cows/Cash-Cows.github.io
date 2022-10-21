window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const trophies = document.querySelector('section.section-2 div.trophies')

  const template = {
    individual: document.getElementById('template-individual').innerHTML,
  }

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

  const networkName = document.getElementById('network').getAttribute('data-value')
  const network = Web3SDK.network(networkName)
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const culling = network.contract('culling')

  //------------------------------------------------------------------//
  // Functions 
  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    trophies.innerHTML = ''

    const tokens = await index.read().ownerTokens(
      nft.address, 
      Web3SDK.state.account,
      4030
    )

    if (!tokens.length) {
      document.querySelector('section.section-2 div.container').prepend(theme.toElement(
        '<div class="alert alert-outline alert-secondary">Don\'t have a '
        + 'cow? Get some <a href="https://opensea.io/collection/cash-cows-crew" '
        + 'target="_blank">@OpenSea</a>!</div>'
      ))
    }

    const redeemable = Web3SDK.toEther(
      await royalty.read()['releaseableBatch(uint256[])'](tokens),
      'number'
    ).toFixed(6)

    const culled = parseFloat(
      await culling.read().balanceOf(Web3SDK.state.account)
    ).toFixed(0)

    holderGoals.forEach(badge => {
      if (tokens.length < badge.count) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} x Cow Holder`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })
      trophies.appendChild(badgeElement)
    })

    wealthGoals.forEach(badge => {
      if (redeemable < badge.value) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.value.toFixed(2)} Redeemable`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })

      trophies.appendChild(badgeElement)
    })

    burnedGoals.forEach(badge => {
      if(culled < badge.count) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} Cows Burned`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })

      trophies.appendChild(badgeElement)
    })

    holderGoals.forEach(badge => {
      if (tokens.length >= badge.count) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} x Cow Holder`,
        '{NAME}': badge.name,
        '{STATUS}': ''
      })
      trophies.appendChild(badgeElement)
    })

    wealthGoals.forEach(badge => {
      if (redeemable >= badge.value) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.value.toFixed(2)} Redeemable`,
        '{NAME}': badge.name,
        '{STATUS}': ''
      })

      trophies.appendChild(badgeElement)
    })

    burnedGoals.forEach(badge => {
      if(culled >= badge.count) return
      const badgeElement = theme.toElement(template.individual, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} Cows Burned`,
        '{NAME}': badge.name,
        '{STATUS}': ' '
      })

      trophies.appendChild(badgeElement)
    })
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  //------------------------------------------------------------------//
  // Initialize
})