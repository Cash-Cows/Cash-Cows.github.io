window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const edition = window.location.pathname.split('/')[3] || 0
  const networkName = window.location.pathname.split('/')[1] || 'ethereum'
  const network = Web3SDK.network(networkName)

  const contract = {
    crew: network.contract('crew'),
    game: network.contract('game'),
    culling: network.contract('culling'),
    royalty: network.contract('royalty')
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

  const template = {
    loot: {
      item: document.getElementById('template-loot').innerHTML,
      modal: document.getElementById('template-loot-modal').innerHTML,
      attribute: document.getElementById('template-loot-attribute').innerHTML
    }
  }

  const messages = [
    'I thought you loved moo.',
    'Moo! Don\'t do it!',
    'Do you want Sacowfice me?',
    'I thought we had something together.',
    'I thought we would grow old together.',
    'Bitch Im a cow. Moo0ooOoove!',
    'Moo. Get rich or die trying...',
    'Buh Bye.',
    'Let\'s get rich together?',
    'Moo. I dare you.',
    'Moo! Do not press that button.',
    'Why me?!?',
    'My milkshake brings all the ETH to the barn.',
    'I have special perks in the end.',
    'What did I do wrong?',
    'I\'m heart broken.',
    'No. Your not worthy.',
    'What did I do to you?',
    'You will not receive 1 steak.',
    'Burn me later for 2 steaks...'
  ]

  //------------------------------------------------------------------//
  // Functions 

  const getRow = async _ => {
    return await (await fetch(`/${networkName}/data/crew/${edition}.json`)).json()
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

  const scaleImageMap = function() {
    function resizeMap() {
      function resizeAreaTag(cachedAreaCoords, idx) {
        function scale(coord) {
          var dimension = 1 === (isWidth = 1 - isWidth) ? 'width' : 'height'
          return (
            padding[dimension] +
            Math.floor(Number(coord) * scalingFactor[dimension])
          )
        }

        var isWidth = 0
        areas[idx].coords = cachedAreaCoords
          .split(',')
          .map(scale)
          .join(',')
      }

      var scalingFactor = {
        width: image.width / image.naturalWidth,
        height: image.height / image.naturalHeight,
      }

      var padding = {
        width: parseInt(
          window.getComputedStyle(image, null).getPropertyValue('padding-left'),
          10
        ),
        height: parseInt(
          window.getComputedStyle(image, null).getPropertyValue('padding-top'),
          10
        ),
      }

      cachedAreaCoordsArray.forEach(resizeAreaTag)
    }

    function getCoords(e) {
      //Normalize coord-string to csv format without any space chars
      return e.coords.replace(/ *, */g, ',').replace(/ +/g, ',')
    }

    function debounce() {
      clearTimeout(timer)
      timer = setTimeout(resizeMap, 250)
    }

    function start() {
      if (
        image.width !== image.naturalWidth ||
        image.height !== image.naturalHeight
      ) {
        resizeMap()
      }
    }

    function addEventListeners() {
      image.addEventListener('load', resizeMap, false) //Detect late image loads in IE11
      window.addEventListener('focus', resizeMap, false) //Cope with window being resized whilst on another tab
      window.addEventListener('resize', debounce, false)
      window.addEventListener('readystatechange', resizeMap, false)
      document.addEventListener('fullscreenchange', resizeMap, false)
    }

    function beenHere() {
      return 'function' === typeof map._resize
    }

    function getImg(name) {
      return document.querySelector('img[usemap="' + name + '"]')
    }

    function setup() {
      areas = map.getElementsByTagName('area')
      cachedAreaCoordsArray = Array.prototype.map.call(areas, getCoords)
      image = getImg('#' + map.name) || getImg(map.name)
      map._resize = resizeMap //Bind resize method to HTML map element
    }

    var /*jshint validthis:true */
      map = this,
      areas = null,
      cachedAreaCoordsArray = null,
      image = null,
      timer = null

    if (!beenHere()) {
      setup()
      addEventListeners()
      start()
    } else {
      map._resize() //Already setup, so just resize map
    }
  }

  const imageMapResize = () => {
    function chkMap(element) {
      if (!element.tagName) {
        throw new TypeError('Object is not a valid DOM element')
      } else if ('MAP' !== element.tagName.toUpperCase()) {
        throw new TypeError(
          'Expected <MAP> tag, found <' + element.tagName + '>.'
        )
      }
    }

    function init(element) {
      if (element) {
        chkMap(element)
        scaleImageMap.call(element)
        maps.push(element)
      }
    }

    var maps

    return function imageMapResizeF(target) {
      maps = [] // Only return maps from this call
      switch (typeof target) {
        case 'undefined':
        case 'string':
          Array.prototype.forEach.call(
            document.querySelectorAll(target || 'map'),
            init
          )
          break
        case 'object':
          init(target)
          break
        default:
          throw new TypeError('Unexpected data type (' + typeof target + ').')
      }

      return maps
    }
  }

  const updateOwner = _ => {
    document.querySelector('div.owner a')
      .setAttribute('href', `/${networkName}/member?address=${Web3SDK.state.owner}`)

    const owner = Web3SDK.state.owner !== Web3SDK.state.account
    document.querySelector('div.owner a').innerHTML = owner
      ? `${Web3SDK.state.owner.substring(0, 4)}...${
        Web3SDK.state.owner.substring(Web3SDK.state.owner.length - 4)
      }`: 'You'

    theme.hide('div.owner', false)

    if (Web3SDK.state.owner === Web3SDK.state.account) {
      theme.hide('a.cta-redeem', false)
      theme.hide('a.tab', false)
    }

    theme.hide('section.section-menu', false)
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('web3sdk-connected', async _ => {
    if (Web3SDK.state.owner) updateOwner()
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.reload()
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

  window.addEventListener('rewards-init', async e => {
    const row = await getRow()
    if (!row) return

    //get total rewards
    e.for.querySelector('span.value-eth').innerHTML = toFixedNumber(
      Web3SDK.toEther(
        await contract.royalty.read()['releaseable(uint256)'](row.edition),
        'number'
      )
    )

    for (const crypto in treasuryTokens) {
      e.for.querySelector(`span.value-${crypto}`).innerHTML = toFixedNumber(
        Web3SDK.toEther(
          await contract.royalty.read()['releaseable(address,uint256)'](
            treasuryTokens[crypto].address,
            row.edition
          ),
          'number'
        )
      )
    }
  })

  window.addEventListener('redeem-click', async e => {
    const crypto = e.for.getAttribute('data-crypto')
    const tokenId = parseInt(e.for.getAttribute('data-edition'))
    const method = crypto == 'eth' ? 'release(uint256)': 'release(address,uint256)'
    const args = crypto == 'eth' ? [ tokenId ]: [
      network.contract(crypto).address, 
      tokenId 
    ]

    //gas check
    try {
      await contract.royalty.gas(Web3SDK.state.account, 0)[method](...args)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'int').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'int').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
    //now redeem
    try {
      const confirmations = 2
      await contract.royalty.write(Web3SDK.state.account, 0, {
        hash: function(resolve, reject, hash) {
          notify(
           'success', 
           `Transaction started on <a href="${network.config.chain_scanner}/tx/${hash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        },
        confirmation: function(resolve, reject, confirmationNumber, receipt) {
          if (confirmationNumber > confirmations) return
          if (confirmationNumber == confirmations) {
           notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>.`)
           window.location.reload()
           resolve()
           return
          }
          notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
          </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
        },
        receipt: function(resolve, reject, receipt) {
          notify(
           'success', 
           `Confirming on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        }
      })[method](...args)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('loots-init', async e => {
    const row = await getRow()
    if (!row) return

    const owned = (await contract.game.read().items(row.characterId))
      .map(item => parseInt(item.collectionTokenId))

    if (!owned.length) {
      e.for.innerHTML = '<div class="alert alert-solid alert-info">No Loot Found.</div>'
      return
    }

    const loots = await (await fetch(`/${networkName}/data/loot.json`)).json()
    
    for (let i = 0; i < loots.length; i++) {
      const loot = loots[i]
      if (owned.indexOf(loot.edition) < 0) {
        continue
      }
      
      const item = theme.toElement(template.loot.item, {
        '{ID}': loot.edition,
        '{IMAGE}': `/images/loot/${loot.edition}.png`
      })

      e.for.appendChild(item)
      window.doon(item)
    }
  })

  window.addEventListener('loot-modal-open-click', async (e) => {
    const id = parseInt(e.for.getAttribute('data-id'))

    const item = await (await fetch(
      `/${networkName}/data/loot/${id.toString(16).padStart(64, '0')}.json`
    )).json()

    const boxes = []
    for (const trait of item.attributes) {
      boxes.push(template.loot.attribute
        .replace('{NAME}', trait.trait_name)
        .replace('{VALUE}', trait.value)
      )
    }

    const modal = theme.toElement(template.loot.modal, {
      '{ID}': item.edition,
      '{IMAGE}': `/images/loot/${item.edition}.png`,
      '{NAME}': item.name,
      '{ATTRIBUTES}': boxes.join('')
    })
    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  window.addEventListener('culling-init', async e => {
    const row = await getRow()
    if (!row) return

    const conversion = await contract.culling.read().tokenConversion()
    const releaseable = Web3SDK.toEther(
      await contract.royalty.read().releaseable(row.edition)
    )

    e.for.querySelector('blockquote').innerHTML = `"${messages[row.edition % messages.length] || messages[0]}"`
    e.for.querySelector('p').innerHTML = releaseable > 0 
    ? `You will receive 1 steak and your unclaimed Ξ ${
      parseFloat(releaseable).toFixed(6)
    } will be exchanged for ${(releaseable * conversion).toFixed(6)} $MILK`
    : `You will receive 1 steak but, you claimed all your rewards! No milk for you. Are you sure?`
  })

  window.addEventListener('burn-click', async e => {
    const tokenId = parseInt(e.for.getAttribute('data-edition'))

    //gas check
    try {
      await contract.culling.gas(Web3SDK.state.account, 0).burnRedeem(tokenId)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'int').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'int').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
    //now redeem
    try {
      const confirmations = 2
      await contract.culling.write(Web3SDK.state.account, 0, {
        hash: function(resolve, reject, hash) {
          notify(
           'success', 
           `Transaction started on <a href="${network.config.chain_scanner}/tx/${hash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        },
        confirmation: function(resolve, reject, confirmationNumber, receipt) {
          if (confirmationNumber > confirmations) return
          if (confirmationNumber == confirmations) {
           notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>.`)
           window.location.reload()
           resolve()
           return
          }
          notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
          </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
        },
        receipt: function(resolve, reject, receipt) {
          notify(
           'success', 
           `Confirming on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        }
      }).burnRedeem(tokenId)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('share-click', _ => {
    navigator.clipboard.writeText(window.location.href)
    notify('success', 'Link copied!')
  })

  window.addEventListener('soon-click', _ => {
    notify('info', 'Coming Soon!')
  })
  
  //------------------------------------------------------------------//
  // Initialize

  contract.crew.read().ownerOf(edition).then(address => {
    Web3SDK.state.owner = address
    updateOwner()
  }).catch(_ => {
    Web3SDK.state.owner = false
    theme.toggle('section.profile', 'burnt', true)
    document.querySelector('section.section-traits h2').innerHTML = 'Cow no longer exists.'
  })
})