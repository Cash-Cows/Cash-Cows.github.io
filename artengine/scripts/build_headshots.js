const fs = require('fs-extra')
const path = require('path')
const cid = require('ipfs-only-hash')

const { createCanvas, loadImage } = require("canvas");

const { 
  paths, 
  image,
  cid_version,
  smoothing
} = require('../config/engine')

function purge() {
  const destination = path.join(paths.build, 'headshots')
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true })
  }
  fs.mkdirSync(destination)
}

function makeCanvas(dimensions) {
  const area = createCanvas(dimensions.width, dimensions.height)
  const ctx = area.getContext('2d')
  ctx.imageSmoothingEnabled = smoothing
  return { dimensions, area, ctx }
}

async function drawImage(canvas, imageObject) {
  const width = canvas.dimensions.width;
  const height = canvas.dimensions.height;

  const hat = makeCanvas({ width, height })
  hat.ctx.drawImage(imageObject, 0, 0, width, 650, 0, 0, width, 650);

  const head = makeCanvas({ width, height })
  head.ctx.drawImage(imageObject, 0, 0, width, height)
  head.ctx.globalCompositeOperation = 'destination-in'
  head.ctx.beginPath()
  head.ctx.arc(1000, 822, 625, 0, Math.PI * 2)
  head.ctx.closePath()
  head.ctx.fill()

  const headshot = makeCanvas({ width, height })

  headshot.ctx.imageSmoothingEnabled = false;
  headshot.ctx.globalAlpha = 1
  headshot.ctx.globalCompositeOperation = 'source-over'
  headshot.ctx.drawImage(hat.area, 0, 0, width, height)
  headshot.ctx.drawImage(head.area, 0, 0, width, height)

  const pixels = headshot.ctx.getImageData(0, 0, width, height)

  const bound = {
    top: null,
    left: null,
    right: null,
    bottom: null
  }

  const range = 4

  for (let i = 0; i < pixels.data.length; i += range) {
    if (pixels.data[i + range - 1] !== 0) {
      const x = (i / range) % width;
      const y = ~~((i / range) / width);
  
      if (bound.top === null) {
        bound.top = y;
      }
      
      if (bound.left === null) {
        bound.left = x; 
      } else if (x < bound.left) {
        bound.left = x;
      }
      
      if (bound.right === null) {
        bound.right = x; 
      } else if (bound.right < x) {
        bound.right = x;
      }
      
      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  const trimHeight = bound.bottom - bound.top
  const trimWidth = bound.right - bound.left
  
  const trimmed = makeCanvas({ width: trimWidth, height: trimHeight })
  trimmed.ctx.putImageData(headshot.ctx.getImageData(
    bound.left, 
    bound.top, 
    trimWidth, 
    trimHeight
  ), 0, 0)

  canvas.image = trimmed.area.toBuffer('image/png')
  canvas.cid = await cid.of(canvas.image, { cidVersion: cid_version })
}

async function main() {
  const images = path.resolve(paths.build, 'transparent')
  if (!fs.existsSync(images)) throw new Error('build/transparent folder missing')
  //purge
  purge()
  //loop through image files
  const files = await fs.promises.readdir(images)
  for( const name of files ) {
    //check image
    const imagePath = path.join(images, name)
    const imageStat = await fs.promises.stat(imagePath)
    //if not a file
    if(!imageStat.isFile()) {
      console.error(`Skipping ${name}, not a file`)
      continue
    //if not a png
    } else if (path.extname(imagePath) !== '.png') {
      console.error(`Skipping ${name}, not a png`)
      continue
    }

    //draw
    const canvas = makeCanvas(image)
    await drawImage(canvas, await loadImage(imagePath))
    //save
    console.log('Saving', name)
    //save image
    fs.writeFileSync(
      path.join(paths.build, `headshots/${name}`), 
      canvas.image
    )
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
