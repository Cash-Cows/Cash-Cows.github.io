window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  let database = []

  const template = {
    game: document.getElementById('template-game').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

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

  //------------------------------------------------------------------//
  // Functions 

  const getRow = async _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return database.rows.filter(row => row.edition == parseInt(params[1]))[0]
      }
    }
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

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('soon-click', async _ => {
    notify('info', 'Coming Real Soon!')
  })

  window.addEventListener('web3sdk-connected', async _ => {
    database = await (await fetch('/data/metadata.json')).json()
    const row = await getRow()
    if (!row) window.location.href = '/cows.html'
    const stage = parseInt(await metadata.read().stage(row.edition))

    const game = theme.toElement(template.game, {
      '{COLOR}': row.attributes.Background.toLowerCase(),
      '{EDITION}': row.edition,
      '{CONTRACT}': nft.address,
      '{IMAGE}': `/images/collection/${row.edition}_${stage}.png`,
      '{LEVEL}': stage + 1
    })

    document.querySelector('section.section-2 div.container').appendChild(game)
    window.doon(game)
    imageMapResize()()
  })

  window.addEventListener('web3sdk-disconnected',  async _ => {
    window.location.href = '/members.html'
  })

  //------------------------------------------------------------------//
  // Initialize
})
