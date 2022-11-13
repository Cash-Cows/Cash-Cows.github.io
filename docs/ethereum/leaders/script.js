window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    barn: network.contract('barn'),
    milk: network.contract('milk'),
    index: network.contract('index'),
    royalty: network.contract('royalty'),
    metadata: network.contract('metadata')
  }

  const template = {
    row: document.getElementById('template-leader-row').innerHTML
  }

  //------------------------------------------------------------------//
  // Functions 

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {})

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  window.addEventListener('tab-click',  async e => {
    theme.hide('section.tab-content', true)
    theme.hide(e.for.getAttribute('data-target'), false)

    theme.toggle('div.tabs a', 'btn-pixel-secondary', true)
    theme.toggle('div.tabs a', 'btn-pixel-warning', false)
    theme.toggle(e.for, 'btn-pixel-secondary', false)
    theme.toggle(e.for, 'btn-pixel-warning', true)
  })

  //------------------------------------------------------------------//
  // Initialize

  //load leaderboards
  const boards = ['crew', 'milk', 'dolla']
  for (const name of boards) {
    const response = await fetch(`https://api.cashcows.club/leaderboard/${name}.php`)
    const leaders = (await response.json()).holders.map(row => {
      if (!/^[0-9]*(\.[0-9]+)*$/.test(row.balance)) {
        row.balance = parseFloat(
          Web3SDK.toEther((new bigDecimal(row.balance)).getValue())
        ).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }
      return row
    })

    const board = document.querySelector(`section.section-${name} tbody`)
    board.innerHTML = ''
    for (let i = 0; i < leaders.length; i++) {
      if (i >= 20) break

      const row = leaders[i]
      let avatar = '/images/about/cow-bored.png'

      let rank = i + 1
      if (i < 3) {
        rank = `<img class="winner" src="/images/leader-${i + 1}.png" />`
      }

      const tableRow = theme.toElement(template.row
        .replace('{RANK}', rank)
        .replace('{NETWORK}', networkName)
        .replace('{NETWORK}', networkName)
        .replace('{AVATAR}', avatar)
        .replace('{NAME}', `${row.address.substring(0, 4)}...${
          row.address.substring(row.address.length - 4)
        }`)
        .replace('{ADDRESS}', row.address)
        .replace('{ADDRESS}', row.address)
        .replace('{ADDRESS}', row.address)
        .replace('{BALANCE}', row.balance)
        .replace('{PERCENT}', `${row.share}%`)
      )

      contract.index.read().ownerTokens(
        contract.crew.address, 
        row.address,
        4030
      ).then(tokens => {
        if (tokens.length) {
          tableRow.querySelector('img.avatar').setAttribute(
            'src', 
            `https://cdn.cashcows.club/crew/preview/${tokens[0]}_2.png`
          )
        }
      })

      board.appendChild(tableRow)
    }
  }
})