window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}
  const range = 24
  
  let page = 0
  let loading = false
  let filters = {}

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
    const matches = database.filter(row => {
      const criteria = {}
      Object.keys(filters).forEach(traitType => {
        criteria[traitType] = row.attributes[traitType]
          ? criteria[traitType] = filters[traitType].indexOf(
            row.attributes[traitType]
          ) > -1
          : false
      })

      for (const name in criteria) {
        if (!criteria[name]) {
          return false
        }
      }

      return true
    }).sort(() => Math.random() - 0.5).slice(start, start + range)

    for (const row of matches) {
      const tokenId = row.edition
      const index = row.edition - 1
      const stage = parseInt(await metadata.read().stage(tokenId))
      const item = theme.toElement(template.item, {
        '{INDEX}': index,
        '{NAME}': `#${tokenId}`,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `/images/collection/${tokenId}_${stage}.png`
      })
      results.appendChild(item)
      window.doon(item)
    }
  }

  const populate = function() {
    database.forEach((row, i) => {
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait]
        if (!occurances[trait]) occurances[trait] = {}
        if (!occurances[trait][value]) occurances[trait][value] = 0
        occurances[trait][value]++
      })
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

  window.addEventListener('filter-click', (e) => {
    filters = {}
    document.querySelectorAll('aside.filters input[type=checkbox]').forEach(input => {
      if (!input.checked) return
      const name = input.name.replace('attribute[', '').replace(']', '')
      if (!filters[name]) {
        filters[name] = []
      }
      filters[name].push(input.value)
    })

    results.innerHTML = ''
    renderResults()
  })

  window.addEventListener('modal-open-click', async (e) => {
    const level = parseInt(e.for.getAttribute('data-level'))
    const index = parseInt(e.for.getAttribute('data-index'))
    const row = database[index]
    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait]
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
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{ID}': row.edition,
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

  populate()
  renderResults()
})