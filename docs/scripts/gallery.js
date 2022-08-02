window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const range = 24
  
  let occurances = {}
  let page = 0
  let loading = false
  let order = () => Math.random() - 0.5
  let filters = {}
  let abort = false
  let rendering = false

  const results = document.querySelector('main.results')
  const pagination = document.querySelector('div.pagination')
  const attributesOptions = document.querySelector('aside.filters div.attributes div.options')

  const template = {
    row: document.getElementById('template-form-row').innerHTML,
    fieldset: document.getElementById('template-form-fieldset').innerHTML,
    item: document.getElementById('template-result-item').innerHTML,
    modal: document.getElementById('template-modal').innerHTML,
    attribute: document.getElementById('template-attribute-box').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

  //------------------------------------------------------------------//
  // Functions

  const renderResults = async function(start = 0, range = 24) {
    rendering = true
    
    const matches = database.filter(row => {
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

    for (const row of matches) {
      if (abort) {
        rendering = false
        abort = false
        return
      }
      const tokenId = row.edition
      const index = row.edition - 1
      const stage = parseInt(await metadata.read().stage(tokenId))
      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }
      const item = theme.toElement(template.item, {
        '{INDEX}': index,
        '{NAME}': `#${tokenId}`,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{SCORE}': row.score,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `/images/collection/${tokenId}_${stage}.png`
      })
      results.appendChild(item)
      window.doon(item)
    }

    rendering = false
  }

  const rarity = function() {
    occurances = {}
    database.forEach(row => {
      Object.keys(row.attributes).forEach(trait => {
        if (trait == 'Level' && !row.attributes[trait]) {
          row.attributes[trait] = 0
        }
        const value = String(row.attributes[trait])
        if (!occurances[trait]) occurances[trait] = {}
        if (!occurances[trait][value]) occurances[trait][value] = 0
        occurances[trait][value]++
        //reformat
        row.attributes[trait] = { value }
      })
    })

    //add occurance and score to each
    database.forEach(row => {
      row.score = 0
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait].value
        const occurance = occurances[trait][value]
        row.attributes[trait].occurances = occurance
        row.attributes[trait].score = 1 / (occurance / database.length)
        row.score += row.attributes[trait].score
      })
      row.score += row.attributes.Level.value * 2000
    })

    //now we need to determine each rank
    let rank = 1
    const ranked = database.slice().sort((a, b) => b.score - a.score)
    ranked.forEach((row, i) => {
      row.rank = i == 0 
        || Math.floor(ranked[i - 1].score * 100) == Math.floor(row.score * 100) 
        ? rank
        : ++rank
    })
  
    //populate attribute filters
    for (const attribute in occurances) {
      const set = theme.toElement(template.fieldset, {'{LEGEND}': attribute})
      const fields = set.querySelector('div.fields')
      Object.keys(occurances[attribute])
        .sort((a, b) => occurances[attribute][a] - occurances[attribute][b])
        .forEach(trait => {
          const row = theme.toElement(template.row, {
            '{NAME}': `attribute[${attribute}]`,
            '{VALUE}': trait,
            '{LABEL}': trait,
            '{COUNT}': occurances[attribute][trait]
          })
      
          fields.appendChild(row)
        })
  
      attributesOptions.appendChild(set)
      window.doon(set)
    }
  }

  //------------------------------------------------------------------//
  // Events

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

  window.addEventListener('modal-open-click', async (e) => {
    const level = parseInt(e.for.getAttribute('data-level'))
    const index = parseInt(e.for.getAttribute('data-index'))
    const row = database[index]
    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait].value
      const occurance = occurances[trait][value]
      const percent = Math.floor(
        (occurance / database.length) * 10000
      ) / 100
      boxes.push(template.attribute
        .replace('{NAME}', trait)
        .replace('{VALUE}', value)
        .replace('{PERCENT}', percent)
      )
    })

    const releaseable = parseInt(
      await royalty.read()['releaseable(uint256)'](row.edition)
    )
    const modal = theme.toElement(template.modal, {
      '{COLOR}': row.attributes.Background.value.toLowerCase(),
      '{ID}': row.edition,
      '{RANK}': row.rank,
      '{CONTRACT}': nft.address,
      '{IMAGE}': `/images/collection/${row.edition}_${level - 1}.png`,
      '{REWARDS}': parseFloat(
        Web3SDK.toEther(releaseable, 'number') || '0.00'
      ).toFixed(5),
      '{LEVEL}': level,
      '{ATTRIBUTES}': boxes.join('')
    })

    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  window.addEventListener('scroll', async (e) => {
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

  //count occurances
  database.forEach((row, i) => {
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
      if (!occurances[trait]) occurances[trait] = {}
      if (!occurances[trait][value]) occurances[trait][value] = 0
      occurances[trait][value]++
    })
  })

  rarity()
  renderResults()

  //check edition
  const query = new URLSearchParams(window.location.search)
  for (const params of query) {
    if (params[0] === 'edition') {
      const tokenId = parseInt(params[1])
      const row = database[tokenId - 1]
      const stage = parseInt(await metadata.read().stage(tokenId))
      const trigger = document.createElement('div')
      trigger.setAttribute('data-level', stage + 1)
      trigger.setAttribute('data-index', tokenId - 1)
      trigger.setAttribute('data-do', 'modal-open')
      trigger.setAttribute('data-on', 'click')
      window.doon(trigger)
      trigger.click()
    }
  }
})