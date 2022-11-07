window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const { gifparser, GIF: gifmaker } = window

  let start = 0
  const range = 50

  const query = document.getElementById('meme-search')
  const results = document.querySelector('div.meme-results')

  const template = {
    meme: document.getElementById('template-meme').innerHTML
  }

  //------------------------------------------------------------------//
  // Functions 

  const getEdition = _ => {
    const query = new URLSearchParams(window.location.search)
    for (const params of query) {
      if (params[0] === 'edition') {
        return params[1]
      }
    }
  }

  const search = async init => {
    theme.hide('a.next', true)
    
    const q = query.value.trim()
    if (!init) {
      if (!q.length) return notify('error', 'Search is empty')
      notify('info', 'Generating memes. Please Wait...')
    }

    const response = q.length ? await fetch(
      `https://www.incept.asia/cashcows/meme.php?q=${q}&start=${start}&range=${range}`
    ): await fetch(
      `https://www.incept.asia/cashcows/meme.php?start=${start}&range=${range}`
    )
    const json = await response.json()

    if (!start) results.innerHTML = ''

    for (const row of json.results) {
      if (!row.data?.length) continue
      //generate gif
      const blob = await faceswap(row, await randomCow())
      //if there not a gif
      if (!blob) continue
      const meme = theme.toElement(template.meme, {
        '{ID}': row.id,
        '{UP}': row.up,
        '{NAME}': row.description.replace(/\s+/g, '-'),
        '{DOWN}': row.down,
        '{IMAGE}': URL.createObjectURL(blob)
      })
      results.appendChild(meme)
      window.doon(meme)
    }

    next = json.next
    theme.hide('a.next', !json.results.length)
    notify('success', 'Generation complete')
  }

  const faceswap = async (meme, cow) => {
    //parse gif
    const gif = await fetch(meme.url)
      .then(response => response.arrayBuffer())
      .then(buffer => gifparser.parseGIF(buffer))
    
    //get gif frames
    const frames = gifparser.decompressFrames(gif, true)
    //if no frames return false
    if (!frames.length) return false
    //get all frames data
    const framesData = await getAllFramesData(frames, meme.data)
    //initialze the animation
    const animation = new gifmaker({
      workerScript: '/scripts/gifworker.js',
      workers: 2,
      quality: 10
    })

    for (const frameData of framesData) {
      for (let i = 0; i < frameData.faces.length; i++) {
        //this is a test that draws a box
        //(new faceapi.draw.DrawBox(resized)).draw(active)
        frameData.canvas.getContext('2d').drawImage(cow, 
          0, 0, cow.width, cow.height,
          frameData.faces[i].x,
          frameData.faces[i].y,
          frameData.faces[i].width,
          frameData.faces[i].height
        )
      }

      if (frameData.frame.delay) {
        animation.addFrame(frameData.canvas, {delay: frameData.frame.delay});
      } else {
        animation.addFrame(frameData.canvas);
      }
    }

    return await new Promise(resolve => {
      animation.on('finished', blob => resolve(blob))
      try {
        animation.render();
      } catch(e) {
        console.log('skipped', meme.url)
        resolve(false)
      }
    })
  }

  const getAllFramesData = async (frames, faces) => {
    //make a master frame
    const master = gifparser.makeCanvas(frames[0])
    const allFramesData = []
    for (let i = 0; i < frames.length; i++) {
      //draw frame on top of the master frame
      gifparser.drawPatch(master, frames[i])
      //copy the master canvas to the active one
      const canvas = copyCanvas(master.canvas, cloneCanvas(master.canvas))
      allFramesData.push({ canvas, frame: frames[i], faces: faces[i] })
    }

    return allFramesData
  }

  const copyCanvas = (source, destination) => {
    // draw source over the destination canvas
    destination.getContext('2d').drawImage(source, 0, 0)
    return destination
  }

  const cloneCanvas = (source) => {
    const canvas = document.createElement('canvas')
    //get the dims
    canvas.width = source.width
    canvas.height = source.height
    // draw source over the destination canvas
    canvas.getContext('2d').drawImage(source, 0, 0)
    return canvas
  }

  const randomCow = async _ => {
    return new Promise(resolve => {
      const cow = new Image()
      const edition = getEdition() || Math.floor(Math.random() * 4030) + 1
      const level = Math.floor(Math.random() * 2)
      cow.onload = _ => resolve(cow)
      cow.setAttribute('crossOrigin', '')
      cow.src = `https://assets.wearecashcows.com/cashcows/crew/headshots/${edition}_${level}.png`
    })
  }

  //------------------------------------------------------------------//
  // Events

  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault()
    return false
  })

  window.addEventListener('meme-search-submit', async _ => {
    start = 0
    await search(false)
  })

  window.addEventListener('meme-next-click', async _ => {
    start += range
    await search(true)
  })

  window.addEventListener('vote-up-click', async e => {
    if (!Web3SDK.state?.account) return notify('error', 'You must connect your wallet first.')

    const id = e.for.getAttribute('data-id')

    const response = await fetch(
      `https://www.incept.asia/cashcows/vote.php?id=${id}&address=${Web3SDK.state.account.substring(2)}&up=1`
    )
    const json = await response.json()
    if (json.error) return notify('error', json.message)
    const badge = e.for.querySelector('span.badge')
    const count = parseInt(badge.innerText.trim())
    badge.innerHTML = count + 1
  })

  window.addEventListener('vote-down-click', async e => {
    if (!Web3SDK.state?.account) return notify('error', 'You must connect your wallet first.')

    const id = e.for.getAttribute('data-id')
    
    const response = await fetch(
      `https://www.incept.asia/cashcows/vote.php?id=${id}&address=${Web3SDK.state.account.substring(2)}&down=1`
    )
    const json = await response.json()
    if (json.error) return notify('error', json.message)
    const badge = e.for.querySelector('span.badge')
    const count = parseInt(badge.innerText.trim())
    badge.innerHTML = count + 1
  })

  //------------------------------------------------------------------//
  // Initialize

  await search(true)
});