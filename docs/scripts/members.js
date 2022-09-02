window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const template = {
    board: document.getElementById('template-leader-board').innerHTML,
    row: document.getElementById('template-leader-row').innerHTML
  }

  //------------------------------------------------------------------//
  // Functions 

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    window.location.href = './trophies.html'
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  //------------------------------------------------------------------//
  // Initialize

  const response = await fetch('https://www.incept.asia/milk.php')
  const leaders = (await response.json()).holders.map(row => {
    row.balance = Web3SDK.toEther((new bigDecimal(row.balance)).getValue())
    return row
  })

  const board = theme.toElement(template.board)

  leaders.forEach((row, i) => {
    board.querySelector('tbody').appendChild(
      theme.toElement(template.row
        .replace('{INDEX}', i + 1)
        .replace('{ADDRESS}', `${row.address.substring(0, 4)}...${
          row.address.substring(row.address.length - 4)
        }`)
        .replace('{BALANCE}', parseFloat(row.balance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
        .replace('{PERCENT}', `${row.share}%`)
      )
    )
  })

  document.querySelector('section.section-1').appendChild(board)
})