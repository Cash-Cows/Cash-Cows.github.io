window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const network = Web3SDK.network('ethereum')
  const metadata = network.contract('metadata')
  const loot = network.contract('loot')
  const game = network.contract('game')

  //------------------------------------------------------------------//
  // Functions 

  const getRow = async _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return await (await fetch(`/data/crew/${params[1]}.json`)).json()
      }
    }
  }

  const loadHead = async (row, stage) => {
    const head = document.querySelector('header.head a.cow')
    head.setAttribute('href', `./deets.html?edition=${row.edition}`)
    head.innerHTML = `<img src="/images/collection/${row.edition}_${stage}.png" />`
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    const row = await getRow()
    if (!row) window.location.href = './cows.html'
    const stage = parseInt(await metadata.read().stage(row.edition))
    await loadHead(row, stage)
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = './members.html'
  })

  //------------------------------------------------------------------//
  // Initialize
})