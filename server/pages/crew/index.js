window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)
  const range = 24

  let page = 0
  let database = []
  let loading = false
  let order = () => Math.random() - 0.5
  let filters = {}
  let abort = false
  let rendering = false

  const dated = document.querySelector('span.dated')
  const results = document.querySelector('main.results')
  const pagination = document.querySelector('div.pagination')
  const attributesOptions = document.querySelector('aside.filters div.attributes div.options')

  const template = {
    row: document.getElementById('template-form-row').innerHTML,
    fieldset: document.getElementById('template-form-fieldset').innerHTML,
    item: document.getElementById('template-result-item').innerHTML
  }

  const metadata = network.contract('metadata')

  //------------------------------------------------------------------//
  // Functions

  const renderResults = async function(start = 0, range = 24) {
    rendering = true
    
    const matches = database.rows.filter(row => {
      const criteria = {}
      Object.keys(filters).forEach(traitType => {
        criteria[traitType] = row.attributes[traitType].value
          ? criteria[traitType] = filters[traitType].indexOf(
            row.attributes[traitType].value
          ) > -1
          : false
      })

      for (const name in criteria) {
        if (!criteria[name]) {
          return false
        }
      }

      return true
    }).sort(order).slice(start, start + range)

    let listings = {}
    try {
      const query = matches.map(row => `token_ids=${row.edition}`)
      const response = await fetch(`https://www.incept.asia/seaport.php?${query.join('&')}`)
      const json = await response.json()
      json.results.orders.forEach(row => {
        row.maker_asset_bundle.assets.forEach(asset => {
          listings[parseInt(asset.token_id)] = Web3SDK.toEther(row.current_price, 'number')
        })
      })
    } catch(e) {}

    for (const row of matches) {
      if (abort) {
        rendering = false
        abort = false
        return
      }
      const tokenId = row.edition
      const stage = parseInt(await metadata.read().stage(tokenId))
      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }

      let price = ' '
      if (listings[tokenId] > 0) {
        price = 'Ξ ' + listings[tokenId].toFixed(3)
      }

      const item = theme.toElement(template.item, {
        '{PRICE}': price,
        '{NAME}': `#${tokenId}`,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{SCORE}': row.score,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `https://assets.wearecashcows.com/cashcows/crew/image/${tokenId}_${stage}.png`,
        '{HREF}': `/${networkName}/crew/${tokenId}/profile.html`
      })
      results.appendChild(item)
      window.doon(item)
      if (abort) {
        rendering = false
        abort = false
      }
    }

    rendering = false
  }

  const populate = function() {
    dated.innerHTML = (new Date(database.updated)).toString()
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
  
      attributesOptions.appendChild(set)
      window.doon(set)
    }
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('db-crew-ready', _ => {
    database = Web3SDK.state.crew
    populate()
    renderResults()
  })

  window.addEventListener('toggle-click', async(e) => {
    e.for.classList.toggle('open')
    if (e.for.classList.contains('open')) {
      e.for.nextElementSibling.style.display = 'block'
    } else {
      e.for.nextElementSibling.style.display = 'none'
    }
  })

  window.addEventListener('filter-click', async(e) => {
    filters = {}
    document.querySelectorAll('aside.filters input[type=checkbox]').forEach(input => {
      if (!input.checked) return
      const name = input.name.replace('attribute[', '').replace(']', '')
      if (!filters[name]) {
        filters[name] = []
      }
      filters[name].push(input.value)
    })

    if (rendering) {
      abort = true
      const interval = setInterval(() => {
        console.log('aborting to filter')
        if (!abort) {
          clearInterval(interval)
          results.innerHTML = ''
          renderResults()
        }
      }, 10)
    } else {
      results.innerHTML = ''
      renderResults()
    }
  })

  window.addEventListener('sort-change', async(e) => {
    if (e.for.value == 'random') {
      order = () => Math.random() - 0.5
    } else if (e.for.value == 'highest') {
      order = (a, b) => b.edition - a.edition
    } else if (e.for.value == 'lowest') {
      order = (a, b) => a.edition - b.edition
    } else if (e.for.value == 'rare') {
      order = (a, b) => a.rank - b.rank
    } else if (e.for.value == 'common') {
      order = (a, b) => b.rank - a.rank
    }

    if (rendering) {
      abort = true
      const interval = setInterval(() => {
        if (!abort) {
          clearInterval(interval)
          results.innerHTML = ''
          renderResults()
        }
      }, 10)
    } else {
      results.innerHTML = ''
      renderResults()
    }
  })

  document.querySelector('main.body').addEventListener('scroll', async (e) => {
    const top = window.pageYOffset || document.documentElement.scrollTop
    const screenHeight = window.innerHeight
    const totalHeight = window.offsetHeight || document.documentElement.offsetHeight
    const bottom = totalHeight - screenHeight

    if ((top + 100) >= bottom && !loading) {
      loading = true
      theme.hide(pagination, false)
      await renderResults((++page) * range)
      loading = false
      theme.hide(pagination, true)
    }
  })

  //------------------------------------------------------------------//
  // Initialize

  //check edition
  const query = new URLSearchParams(window.location.search)
  for (const params of query) {
    if (params[0] === 'edition') {
      window.location.href = `/${networkName}/crew/${params[1]}/profile.html`
    }
  }
})
