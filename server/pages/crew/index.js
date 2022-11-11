window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    metadata: network.contract('metadata')
  }

  const template = {
    row: document.getElementById('template-form-row').innerHTML,
    fieldset: document.getElementById('template-form-fieldset').innerHTML,
    item: document.getElementById('template-result-item').innerHTML,
    price: document.getElementById('template-price').innerHTML,
    info: document.getElementById('template-info').innerHTML,
    cart: document.getElementById('template-cart-item').innerHTML,
    sweep: document.getElementById('template-sweep-item').innerHTML
  }

  const element = {
    results: document.querySelector('main.results'),
    pagination: document.querySelector('a.pagination'),
    filters: document.querySelector('aside.gallery-filters'),
    options: document.querySelector('main.attributes-body'),
    cart: {
      container: document.querySelector('div.card-cart'),
      items: document.querySelector('div.card-cart main.cart-body'),
      total: document.querySelector('div.card-cart div.total div.amount'),
      count: document.querySelector('div.card-cart header.cart-head span.count')
    },
    sweep: {
      container: document.querySelector('div.card-sweep'),
      items: document.querySelector('div.card-sweep main.sweep-body'),
      input: document.querySelector('div.card-sweep header.sweep-head input'),
      count: document.querySelector('div.card-sweep header.sweep-head div.count'),
      total: document.querySelector('div.card-sweep div.total div.amount')
    }
  }

  let database = []
  let sort = 'floorAskPrice'
  let next = null
  let limit = 50
  let attributes = {}
  
  //------------------------------------------------------------------//
  // Functions

  const search = async _ => {
    const params = new URLSearchParams()
    params.set('collection', `0x.${contract.crew.address.substring(2)}`)
    params.set('limit', String(limit))
    params.set('sortBy', sort)

    for (const trait in attributes) {
      params.set(`attributes[${trait}]`, attributes[trait])
    }
    
    if (next) {
      params.set('continuation', next)
    }
    const response = await fetch(
      `https://www.incept.asia/cashcows/reservoir/tokens/v5?${
        decodeURIComponent(params.toString())
      }`
    )

    const json = await response.json()

    if (json.error) {
      next = null
      theme.hide(element.pagination, true)
      return
    }

    if (!json.results.tokens.length && !next) {
      element.results.innerHTML = '<div class="alert alert-solid alert-info">No Results Found.</div>'
    }

    const items = cartItems()
  
    for (const row of json.results.tokens) {
      const tokenId = row.token.tokenId
      const data = database.rows.filter(
        data => data.edition == parseInt(tokenId)
      )[0]

      if (!data) continue

      let color = 'muted'
      if (data.rank < 100) {
        color = 'success'
      } else if (data.rank < 500) {
        color = 'warning'
      } else if (data.rank < 1000) {
        color = 'info'
      }
      
      const level = data.attributes.Level.value

      const item = theme.toElement(template.item, {
        '{NAME}': `#${tokenId}`,
        '{RANK}': data.rank,
        '{RARITY}': color,
        '{SCORE}': data.score,
        '{EDITION}': tokenId,
        '{LEVEL}': level,
        '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${tokenId}_${level - 1}.png`,
        '{HREF}': `/${networkName}/crew/${tokenId}/profile.html`
      })

      if (row.market?.floorAsk?.price?.amount?.decimal) {
        const price = theme.toElement(template.price, {
          '{EDITION}': tokenId,
          '{CURRENCY}': row.market.floorAsk.price.currency.symbol.toLowerCase(),
          '{SOURCE}': row.market.floorAsk.source.name.toLowerCase(),
          '{AMOUNT}': row.market.floorAsk.price.amount.decimal
        })

        item.appendChild(price)
      } else {
        const info = theme.toElement(template.info, {
          '{HREF}': `/${networkName}/crew/${tokenId}/profile.html`,
          '{MEMBER}': `/${networkName}/member/?address=${row.token.owner}`,
          '{OWNER}': `${row.token.owner.substring(0, 4)}...${
            row.token.owner.substring(row.token.owner.length - 4)
          }`
        })

        item.appendChild(info)
      }

      if (items.indexOf(parseInt(tokenId)) >= 0) {
        theme.toggle(item, 'carted', true)
      }

      element.results.appendChild(item)
      window.doon(item)
    }

    if (json.results.continuation) {
      next = json.results.continuation
      theme.hide(element.pagination, false)
    } else {
      next = null
      theme.hide(element.pagination, true)
    }
  }

  const filters = () => {
    //populate attribute filters
    for (const attribute in database.occurances) {
      const set = theme.toElement(template.fieldset, {'{LEGEND}': attribute})
      const fields = set.querySelector('div.fields')
      Object.keys(database.occurances[attribute])
        .sort((a, b) => database.occurances[attribute][a] - database.occurances[attribute][b])
        .forEach(trait => {
          const row = theme.toElement(template.row, {
            '{NAME}': `attribute[${attribute}]`,
            '{VALUE}': trait,
            '{LABEL}': trait,
            '{COUNT}': database.occurances[attribute][trait]
          })
      
          fields.appendChild(row)
        })
  
      element.options.appendChild(set)
      window.doon(set)
    }
  }

  const addCart = (edition, source, currency, amount) => {
    const item = {
      cart: element.cart.items.querySelector(`div.item[data-edition="${edition}"]`),
      results: element.results.querySelector(`div.item[data-edition="${edition}"]`)
    }
    if (item.cart) return
    const data = database.rows.filter(row => row.edition == edition)[0]
    const level = data.attributes.Level.value

    const row = theme.toElement(template.cart, {
      '{EDITION}': edition,
      '{SOURCE}': source,
      '{CURRENCY}': currency,
      '{AMOUNT}': amount,
      '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${edition}_${level - 1}.png`,
    })

    element.cart.items.appendChild(row)
    window.doon(row)

    theme.hide(element.cart.container.querySelector('div.alert'), true)

    element.cart.total.innerHTML = ` ${cartTotal()}`
    element.cart.count.innerHTML = element.cart.items.children.length

    theme.toggle(item.results, 'carted', true)
  }

  const removeCart = edition => {
    const item = {
      cart: element.cart.items.querySelector(`div.item[data-edition="${edition}"]`),
      results: element.results.querySelector(`div.item[data-edition="${edition}"]`)
    }

    element.cart.items.removeChild(item.cart)
    element.cart.total.innerHTML = ` ${cartTotal()}`
    element.cart.count.innerHTML = element.cart.items.children.length
    if (!element.cart.items.children.length) {
      theme.hide(element.cart.container.querySelector('div.alert'), false)
    }

    if (item.results) {
      theme.toggle(item.results, 'carted', false)
    }
  }

  const cartItems = _ => {
    const items = []
    element.cart.items.querySelectorAll('div.item').forEach(item => {
      items.push(parseInt(item.getAttribute('data-edition')))
    })
    return items
  }

  const cartTotal = _ => {
    let total = 0
    element.cart.items.querySelectorAll('div.item').forEach(item => {
      total += parseFloat(item.getAttribute('data-amount') || '0')
    })
    return toFixedNumber(total)
  }

  const sweepItems = _ => {
    const items = []
    element.sweep.items.querySelectorAll('div.item').forEach(item => {
      items.push(parseInt(item.getAttribute('data-edition')))
    })
    return items
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

  const buy = async tokens => {
    const response = await fetch('https://www.incept.asia/cashcows/reservoir/execute/buy/v4', {
      method: 'POST',
      heaaders: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        onlyPath: false,
        partial: false,
        skipErrors: false,
        skipBalanceCheck: false,
        taker: Web3SDK.state.account,
        currency: '0x0000000000000000000000000000000000000000',
        tokens: tokens
      })
    })

    const json = await response.json()

    if (json.error) return notify('error', json.message)
    if (!Array.isArray(json.results?.steps)) return notify('error', 'No steps provided')
    for (const step of json.results.steps) {
      if (!Array.isArray(step.items) || !step.items.length) continue
      for (const item of step.items) {
        //according to reservoir-client, it is possible 
        //for no data in item, we should poll if this is the case
        if (item.status !== 'incomplete' || !item.data) continue
        await Web3SDK.sendTransaction(item.data, _ => {
          window.location.reload()
        }, e => {
          const message = e.message || e.toString()
          const pattern = /have (\d+) want (\d+)/
          const matches = message.match(pattern)
          if (matches && matches.length === 3) {
            message = message.replace(pattern, `have ${
              Web3SDK.toEther(matches[1], 'int').toFixed(5)
            } ETH want ${
              Web3SDK.toEther(matches[2], 'int').toFixed(5)
            } ETH`)
          }
          return notify('error', message.replace('err: i', 'I'))
        })
      }
    }
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('db-crew-ready', _ => {
    database = Web3SDK.state.crew
    filters()
    search()
  })

  window.addEventListener('toggle-click', async e => {
    if (e.for.classList.contains('open')) {
      e.for.classList.remove('open')
      theme.hide(e.for.nextElementSibling, true)
    } else {
      Array.from(
        e.for.parentNode.parentNode.querySelectorAll('div.card')
      ).forEach(card => theme.hide(card, true))
      Array.from(
        e.for.parentNode.parentNode.querySelectorAll('a.btn')
      ).forEach(trigger => trigger.classList.remove('open'))

      e.for.classList.add('open')
      theme.hide(e.for.nextElementSibling, false)
    }
  })

  window.addEventListener('filter-click', async e => {
    const name = e.for.name.replace('attribute[', '').replace(']', '')
    if (attributes[name] == e.for.value) e.for.checked = false
    attributes = {}
    document.querySelectorAll('main.attributes-body input[type=radio]').forEach(input => {
      if (!input.checked) return
      const name = input.name.replace('attribute[', '').replace(']', '')
      attributes[name] = input.value
    })

    next = null
    element.results.innerHTML = ''
    theme.hide(element.pagination, true)
    search()
  })

  window.addEventListener('sort-change', async e => {
    sort = e.for.value
    next = null
    element.results.innerHTML = ''
    theme.hide(element.pagination, true)
    search()
  })

  window.addEventListener('next-click', async e => {
    theme.hide(element.pagination, true)
    search()
  })

  window.addEventListener('filter-open-click', async e => {
    theme.toggle(element.filters, 'active', true)
  })

  window.addEventListener('filter-close-click', async e => {
    theme.toggle(element.filters, 'active', false)
  })

  window.addEventListener('add-cart-click', async e => {
    const edition = parseInt(e.for.getAttribute('data-edition'))
    const currency = e.for.getAttribute('data-currency')
    const amount = e.for.getAttribute('data-amount')
    const source = e.for.getAttribute('data-source')
    addCart(edition, source, currency, amount)
  })

  window.addEventListener('remove-cart-click', async e => {
    const edition = parseInt(e.for.getAttribute('data-edition'))
    removeCart(edition)
  })

  window.addEventListener('clear-cart-click', async e => {
    element.cart.items.querySelectorAll('div.item').forEach(item => {
      removeCart(parseInt(item.getAttribute('data-edition')))
    })
  })

  window.addEventListener('sweep-range-input', async e => {
    const value = parseInt(e.for.value)
    element.sweep.count.innerHTML = value
    
    let length = element.sweep.items.children.length
    while (length > value) { 
      element.sweep.items.removeChild(
        element.sweep.items.children[--length]
      )
    }

    const items = sweepItems()

    let count = 0
    element.results.querySelectorAll('div.item').forEach(item => {
      if (count >= value) return
      const cart = item.querySelector('a.action-add-cart')
      if (!cart || cart.getAttribute('data-source') !== 'opensea') return
      const edition = parseInt(cart.getAttribute('data-edition'))
      if (items.indexOf(edition) >= 0) return
      count++
      const currency = cart.getAttribute('data-currency')
      const amount = cart.getAttribute('data-amount')
      const data = database.rows.filter(row => row.edition == edition)[0]
      const level = data.attributes.Level.value

      const row = theme.toElement(template.sweep, {
        '{EDITION}': edition,
        '{CURRENCY}': currency,
        '{AMOUNT}': amount,
        '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${edition}_${level - 1}.png`,
      })

      element.sweep.items.appendChild(row)
    })

    let total = 0
    element.sweep.items.querySelectorAll('div.item').forEach(item => {
      total += parseFloat(item.getAttribute('data-amount') || '0')
    })
    element.sweep.total.innerHTML = ` ${toFixedNumber(total)}`
  })

  window.addEventListener('buy-now-click', async e => {
    const edition = e.for.getAttribute('data-edition')
    await buy([`${contract.crew.address}:${edition}`])
  })

  window.addEventListener('cart-buy-click', async e => {
    await buy(
      cartItems().map(tokenId => `${contract.crew.address}:${tokenId}`)
    )
  })

  window.addEventListener('sweep-buy-click', async e => {
    await buy(
      sweepItems().map(tokenId => `${contract.crew.address}:${tokenId}`)
    )
  })

  //------------------------------------------------------------------//
  // Initialize
})
