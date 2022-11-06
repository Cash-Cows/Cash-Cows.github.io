window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    index: network.contract('index'),
    royalty: network.contract('royalty'),
    milk: network.contract('milk'),
    dolla: network.contract('dolla'),
    culling: network.contract('culling'),
    metadata: network.contract('metadata')
  }

  const treasuryTokens = {
    weth: network.contract('weth'),
    usdc: network.contract('usdc'),
    link: network.contract('link'),
    uni: network.contract('uni'),
    ape: network.contract('ape'),
    sand: network.contract('sand'),
    mana: network.contract('mana'),
    gala: network.contract('gala')
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

  const template = {
    crew: document.getElementById('template-crew').innerHTML,
    trophy: document.getElementById('template-trophy').innerHTML
  }

  const element = {
    address: {
      title: document.querySelector('div.address h4'),
      opensea: document.querySelector('div.address a.opensea'),
      looksrare: document.querySelector('div.address a.looksrare'),
      x2y2: document.querySelector('div.address a.x2y2')
    },
    stats: {
      crew: document.querySelector('div.stats div.stat-crew span.value'),
      trophies:  document.querySelector('div.stats div.stat-trophies span.value')
    }
  }

  //------------------------------------------------------------------//
  // Functions 

  const getAddress = _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'address') {
        return params[1]
      }
    }
  }

  const toFixedNumber = function(number, length = 6) {
    const parts = number.toString().split('.')
    const size = length >= parts[0].length ? length - parts[0].length: 0
    if (parts[0].length > 9) {
      return (parseInt(parts[0]) / 1000000000).toFixed(2) + 'B'
    } else if (parts[0].length > 6) {
      return (parseInt(parts[0]) / 1000000).toFixed(2) + 'M'
    } else if (parts[0].length > 3) {
      return (parseInt(parts[0]) / 1000).toFixed(2) + 'K'
    }
    return number.toFixed(size)
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {})

  window.addEventListener('web3sdk-disconnected', async _ => {})

  window.addEventListener('address-init', async _ => {
    const address = getAddress()
    element.address.title.innerHTML = `${address.substring(0, 4)}...${
      address.substring(address.length - 4)
    }`
    element.address.opensea.setAttribute('href', `https://opensea.io/${address}`)
    element.address.looksrare.setAttribute('href', `https://looksrare.org/accounts/${address}`)
    element.address.x2y2.setAttribute('href', `https://x2y2.io/user/${address}`)
  })

  window.addEventListener('stats-init',  async _ => {
    const address = getAddress()

    document.querySelector('span.value-milk').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await contract.milk.read().balanceOf(address), 'number'
      )
    )

    document.querySelector('span.value-dolla').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await contract.dolla.read().balanceOf(address), 'number'
      )
    )

    document.querySelector('span.value-steak').innerHTML = parseFloat(
      await contract.culling.read().balanceOf(address)
    ).toFixed(0)
  })

  window.addEventListener('rewards-init',  async _ => {
    const address = getAddress()
    const tokens = await contract.index.read().ownerTokens(
      contract.crew.address, 
      address,
      4030
    )

    const releaseable = toFixedNumber(
      Web3SDK.toEther(
        await contract.royalty.read()['releaseableBatch(uint256[])'](tokens),
        'number'
      )
    )
  
    document.querySelector('span.value-eth').innerHTML = releaseable
    document.querySelector('div.stat-reward span.value').innerHTML = releaseable

    for (const crypto in treasuryTokens) {
      document.querySelector(`span.value-${crypto}`).innerHTML = toFixedNumber(
        Web3SDK.toEther(
          await contract.royalty.read()['releaseableBatch(address,uint256[])'](
            treasuryTokens[crypto].address,
            tokens
          ),
          'number'
        )
      )
    }
  })

  window.addEventListener('crews-init',  async e => {
    const address = getAddress()
    const crews = await contract.index.read().ownerTokens(
      contract.crew.address, 
      address,
      4030
    )

    if (crews.length) {
      theme.hide('main.body section.member', false)
    } else {
      theme.hide('main.body section.nonmember', false)
    }

    element.stats.crew.innerHTML = crews.length

    for (const tokenId of crews) {
      const stage = parseInt(await contract.metadata.read().stage(tokenId))
      const row = Web3SDK.state.crew.rows.filter(
        row => row.edition == tokenId
      )[0]

      if (!row) return

      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }

      const item = theme.toElement(template.crew, {
        '{NETWORK}': networkName,
        '{EDITION}': row.edition,
        '{LEVEL}': row.attributes.Level.value,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${tokenId}_${stage}.png`
      })

      e.for.appendChild(item)
      window.doon(item)
    }
  })

  window.addEventListener('trophies-init',  async e => {
    const address = getAddress()
    const tokens = await contract.index.read().ownerTokens(
      contract.crew.address, 
      address,
      4030
    )

    const redeemable = Web3SDK.toEther(
      await contract.royalty.read()['releaseableBatch(uint256[])'](tokens),
      'number'
    ).toFixed(6)

    const culled = parseFloat(
      await contract.culling.read().balanceOf(address)
    ).toFixed(0)

    let active = 0

    holderGoals.forEach(badge => {
      if (tokens.length < badge.count) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} x Cow Holder`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })
      e.for.appendChild(badgeElement)
      active++
    })

    wealthGoals.forEach(badge => {
      if (redeemable < badge.value) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.value.toFixed(2)} Redeemable`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })

      e.for.appendChild(badgeElement)
      active++
    })

    burnedGoals.forEach(badge => {
      if(culled < badge.count) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} Cows Burned`,
        '{NAME}': badge.name,
        '{STATUS}': ' active'
      })

      e.for.appendChild(badgeElement)
      active++
    })

    element.stats.trophies.innerHTML = `${active} / ${
      holderGoals.length + wealthGoals.length + burnedGoals.length
    }`

    holderGoals.forEach(badge => {
      if (tokens.length >= badge.count) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} x Cow Holder`,
        '{NAME}': badge.name,
        '{STATUS}': ''
      })
      e.for.appendChild(badgeElement)
    })

    wealthGoals.forEach(badge => {
      if (redeemable >= badge.value) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.value.toFixed(2)} Redeemable`,
        '{NAME}': badge.name,
        '{STATUS}': ''
      })

      e.for.appendChild(badgeElement)
    })

    burnedGoals.forEach(badge => {
      if(culled >= badge.count) return
      const badgeElement = theme.toElement(template.trophy, {
        '{IMAGE}': badge.image,
        '{CONTENT}': `${badge.count} Cows Burned`,
        '{NAME}': badge.name,
        '{STATUS}': ' '
      })

      e.for.appendChild(badgeElement)
    })
  })

  window.addEventListener('tab-click', async e => {
    theme.toggle('a.tab', 'active', false)
    theme.toggle(e.for, 'active', true)
    theme.hide('.tab-content', true)
    theme.hide(e.for.getAttribute('data-target'), false)

    if (e.for.getAttribute('data-target') === 'section.section-map'
      && e.for.getAttribute('data-loaded') !== 'loaded'
    ) {
      imageMapResize()()
      e.for.setAttribute('data-loaded', 'loaded')
    }
  })

  window.addEventListener('share-click', _ => {
    navigator.clipboard.writeText(window.location.href)
    notify('success', 'Link copied!')
  })

  //------------------------------------------------------------------//
  // Initialize

  document
    .querySelector('a.social-twitter')
    .setAttribute('href', `https://twitter.com/intent/tweet?hashtags=cashcows,sharethewealth&text=Checkout+this+Cash+Cows+member.+Moo!&url=wearecashcows.com/ethereum/member/?address=${getAddress()}`)
})