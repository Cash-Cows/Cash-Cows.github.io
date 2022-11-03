window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const goals = [
    { value: 10, image: "/images/badges/community/morgan_stanley.png" },
    { value: 50, image: "/images/badges/community/wells_fargo.png" },
    { value: 100, image: "/images/badges/community/bank_of_america.png" },
    { value: 250, image: "/images/badges/community/citi.png" },
    { value: 500, image: "/images/badges/community/jpmorgan.png" },
    { value: 1000, image: "/images/badges/community/ethereum.png" },
  ]

  const template = {
    community: document.getElementById('template-community-goal').innerHTML,
  }

  const networkName = 'ethereum'
  const network = Web3SDK.network(networkName)
  const royalty = network.contract('royalty')

  //------------------------------------------------------------------//
  // Functions

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

  window.addEventListener('goals-init', async (e) => {
    let unclaimed = 3.496336
    let redeemed = 2.879933
    try {
      unclaimed = parseFloat(Web3SDK.toEther(
        (await Web3SDK.web3().eth.getBalance(royalty.address)).toString(), 
        'number'
      ))
      redeemed =  parseFloat(Web3SDK.toEther(
        (await royalty.read()['totalReleased()']()).toString(),
        'number'
      ))
    } catch(e) {}
    const totalVolume = (unclaimed + redeemed) * 10

    //get unclaimed
    e.for.querySelector('span.treasury-unclaimed span.value').innerHTML = unclaimed.toFixed(6)
    //get redeemed
    e.for.querySelector('span.treasury-redeemed span.value').innerHTML = redeemed.toFixed(6)

    goals.forEach(goal => {
      const goalElement = theme.toElement(template.community, {
        '{IMAGE}': goal.image,
        '{VALUE}': goal.value,
        // '' empty string for incomplete, 'completed' for completed
        '{STATUS}': totalVolume > goal.value ? 'completed' : '',
      })

      e.for.querySelector('div.community').appendChild(goalElement)
    })
  })

  window.addEventListener('modal-open-click', async (e) => {
    theme.hide(document.querySelector(
      e.for.getAttribute('data-target')
    ), false)
  })

  window.addEventListener('modal-close-click', _ => {
    theme.hide('div.modal', true)
  })

  //------------------------------------------------------------------//
  // Initialize

  imageMapResize()()


  window.doon(document.body)
})