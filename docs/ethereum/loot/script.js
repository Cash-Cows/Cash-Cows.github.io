window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    loot: network.contract('loot'),
    game: network.contract('game'),
    dolla: network.contract('dolla')
  }

  const template = {
    item: document.getElementById('template-item').innerHTML,
    price: document.getElementById('template-price').innerHTML,
    modal: document.getElementById('template-modal').innerHTML,
    attribute: document.getElementById('template-attribute').innerHTML
  }

  const zero = '0x0000000000000000000000000000000000000000'

  //------------------------------------------------------------------//
  // Functions 

  const toFixedNumber = function(number, length = 4) {
    const parts = number.toString().split('.')

    if (parts[0].length > 9) {
      return (parseInt(parts[0]) / 1000000000).toFixed(2) + 'B'
    } else if (parts[0].length > 6) {
      return (parseInt(parts[0]) / 1000000).toFixed(2) + 'M'
    } else if (parts[0].length > 3) {
      return (parseInt(parts[0]) / 1000).toFixed(2) + 'K'
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.')
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {})

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  window.addEventListener('tab-click',  async e => {
    theme.hide('div.category', true)
    theme.hide(e.for.getAttribute('data-target'), false)

    theme.toggle('nav.tabs a', 'btn-pixel-warning', false)
    theme.toggle(e.for, 'btn-pixel-warning', true)
  })

  window.addEventListener('modal-open-click', async (e) => {
    const id = parseInt(e.for.getAttribute('data-id'))

    const item = await (await fetch(
      `/${networkName}/data/loot/${id.toString(16).padStart(64, '0')}.json`
    )).json()

    const supply = await contract.loot.read().totalSupply(item.edition)
    const prices = [ 
      ['dolla', contract.dolla.address, item.pricing[contract.dolla.address] || 0], 
      ['eth', zero, item.pricing[zero] || 0] 
    ]
    .filter(amount => amount[2] != 0)
    .map(amount => {
      const price = `<span>${toFixedNumber(Web3SDK.toEther(
        amount[2], 
        'string'
      ))}</span>`

      return template.price
        .replace('{ID}', id)
        .replace('{ITEM}', item.itemId)
        .replace('{CURRENCY}', amount[0])
        .replace('{CURRENCY}', amount[0])
        .replace('{PRICE}', price)
    })

    const boxes = []
    for (const trait of item.attributes) {
      boxes.push(template.attribute
        .replace('{NAME}', trait.trait_name)
        .replace('{VALUE}', trait.value)
      )
    }

    let quantity = ''
    if (item.limit > 0) { 
      const available = item.limit - supply
      if (supply > 0 && (supply / item.limit) > 0.5) {
        quantity = `<div class=quantity>${available} of ${item.limit} remaining</div>`
      } else {
        quantity = `<div class=quantity>only ${available} available</div>`
      }
    }

    const modal = theme.toElement(template.modal, {
      '{ID}': item.edition,
      '{IMAGE}': `/images/loot/${item.edition}.png`,
      '{NAME}': item.name,
      '{QUANTITY}': quantity,
      '{PRICE}': prices.join(''),
      '{ATTRIBUTES}': boxes.join('')
    })
    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  window.addEventListener('mint-click', async e => {
    notify('info', 'Available for members, choose a cow and visit Rodeo Drive.')
  })

  //------------------------------------------------------------------//
  // Initialize

  fetch(`/${networkName}/data/loot.json`)
    .then(response => response.json())
    .then(loots => {
      const now = Date.now()
      for (let i = 0; i < loots.length; i++) {
        const loot = loots[i]
        if (now < loot.available || !Object.keys(loot.pricing).length) {
          continue
        }
        
        const item = theme.toElement(template.item, {
          '{ID}': loot.edition,
          '{IMAGE}': `/images/loot/${loot.edition}.png`,
          '{NAME}': loot.name
        })
        document.getElementById(loot.category.toLowerCase()).append(item)
        window.doon(item)
      }
    })
})