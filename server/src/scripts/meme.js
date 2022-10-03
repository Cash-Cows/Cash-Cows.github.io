window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables

  const { faceapi, gifparser, GIF: gifmaker } = window

  const template = {}

  let next = 0
  let loading = true

  const query = document.getElementById('meme-search')
  const results = document.querySelector('div.meme-results')

  //------------------------------------------------------------------//
  // Functions 

  const search = async _ => {
    theme.hide('a.next', true)
    if (loading) return notify('error', 'Models are still loading')
    const q = query.value.trim()
    if (!q.length) return notify('error', 'Search is empty')
    notify('info', 'Generating memes. Please Wait...')
    if (!next) results.innerHTML = ''

    const response = next 
      ? await fetch(`https://www.incept.asia/tenor.php?q=${q}&pos=${next}`)
      : await fetch(`https://www.incept.asia/tenor.php?q=${q}`)
    
    const json = await response.json()

    for (const row of json.results) {
      if (!row.media_formats?.gif?.url) continue
      //generate gif
      const blob = await faceswap(
        row.media_formats.gif.url, 
        randomCows(100)
      )
      //if there not a gif
      if (!blob) continue
      //make a new image
      const image = new Image()
      image.src = URL.createObjectURL(blob)
      results.appendChild(image)
    }

    next = json.next
    theme.hide('a.next', !next)
    notify('success', 'Generation complete')
  }

  const faceswap = async (url, cows) => {
    //parse gif
    const gif = await fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => gifparser.parseGIF(buffer))
    
    //get gif frames
    const frames = gifparser.decompressFrames(gif, true)
    //if no frames return false
    if (!frames.length) return false
    //get all frames data
    const framesData = await getAllFramesData(frames)
    //if no frames data
    if (!framesData) return false
    //initialze the animation
    const animation = new gifmaker({
      workerScript: '/scripts/lib/gifworker.js',
      workers: 2,
      quality: 10
    })

    for (const frameData of framesData) {
      if (frameData.faces) {
        for (let i = 0; i < frameData.faces.length; i++) {
          //this is a test that draws a box
          //(new faceapi.draw.DrawBox(resized)).draw(active)
          frameData.canvas.getContext('2d').drawImage(cows[i], 
            0, 0, cows[i].width, cows[i].height,
            frameData.faces[i].x,
            frameData.faces[i].y,
            frameData.faces[i].width,
            frameData.faces[i].height
          )
        }
      }

      if (frameData.frame.delay) {
        animation.addFrame(frameData.canvas, {delay: frameData.frame.delay});
      } else {
        animation.addFrame(frameData.canvas);
      }
    }

    return await new Promise(resolve => {
      animation.on('finished', blob => resolve(blob))
      animation.render();
    })
  }

  const getAllFramesData = async (frames, padding = 0.4) => {
    //make a master frame
    const master = gifparser.makeCanvas(frames[0])
    let firstFaces = false
    let lastFaces = false
    const allFramesData = []
    for (const frame of frames) {
      //draw frame on top of the master frame
      gifparser.drawPatch(master, frame)
      //copy the master canvas to the active one
      const canvas = copyCanvas(master.canvas, cloneCanvas(master.canvas))
      //get the new master blob data
      const blob = await new Promise(resolve => master.canvas.toBlob(resolve))
      //convert it to a native image class
      const image = await faceapi.bufferToImage(blob)
      //detect all faces
      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors()
      //if no faces
      if (!detections.length) {
        //mark it as false or use the last set of faces
        allFramesData.push({ image, canvas, frame, faces: lastFaces })
        //and move on
        continue
      }

      //resize the results based on the display size
      lastFaces = faceapi.resizeResults(detections, { 
        width: image.width, 
        height: image.height 
      //then resize again, adding padding
      }).map(face => outerBox(
        face.detection.box, 
        padding
      ))

      //if this is the first set of faces, set it
      if (!firstFaces) firstFaces = lastFaces
      
      allFramesData.push({ image, canvas, frame, faces: lastFaces })
    }

    //if no faces found
    if (!lastFaces) return false

    //fill all the false faces with the first faces
    allFramesData.forEach(data => data.faces = data.faces ? data.faces : firstFaces)

    return allFramesData
  }

  const randomCows = length => {
    const cows = []

    const cow = new Image()
    const index = Math.floor(Math.random() * 4) + 1
    cow.src = `/images/memes/meme-cow-${index}.png`

    for(let i = 0; i < length; i++) {
      cows.push(cow)
    }
    
    return cows
  }

  const outerBox = (box, percent) => {
    const padding = {
      x: box.width * percent,
      y: box.height * percent
    }
    return {
      x: box.x - padding.x,
      y: box.y - (padding.y * 1.5),
      width: box.width + (padding.x * 2),
      height: box.height + (padding.y * 2)
    }
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

  //------------------------------------------------------------------//
  // Events

  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault()
    return false
  })

  window.addEventListener('meme-search-submit', async _ => {
    next = 0
    await search()
  })

  window.addEventListener('meme-next-click', async _ => await search())

  //------------------------------------------------------------------//
  // Initialize

  notify('info', 'Loading models...')

  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  ]).then(_ => {
    loading = false
    notify('success', 'Models loaded')
  })
});