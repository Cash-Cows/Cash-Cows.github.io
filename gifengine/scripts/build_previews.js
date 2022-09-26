const fs = require('fs-extra')
const path = require('path')
const cid = require('ipfs-only-hash')

const { createCanvas, loadImage } = require("canvas");

const { 
  paths, 
  preview,
  cid_version,
  smoothing
} = require('../config/engine')

function purge() {
  const previewPath = path.join(paths.build, 'preview')
  if (fs.existsSync(previewPath)) {
    fs.rmSync(previewPath, { recursive: true })
  }
  fs.mkdirSync(previewPath)
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
  canvas.ctx.imageSmoothingEnabled = false;
  canvas.ctx.drawImage(imageObject, 0, 0, width, height);
  canvas.ctx.drawImage(canvas.area, 0, 0, width, height, 0, 0, canvas.area.width, canvas.area.height);
  canvas.image = canvas.area.toBuffer('image/png')
  canvas.cid = await cid.of(canvas.image, { cidVersion: cid_version })
}

async function main() {
  const images = path.resolve(paths.build, 'image')
  if (!fs.existsSync(images)) throw new Error('build/images folder missing')
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
    const lores = makeCanvas(preview)
    const imageObject = await loadImage(imagePath)
    await drawImage(lores, imageObject)
    //save
    console.log('Saving', name, lores.cid)
    //save image
    fs.writeFileSync(
      path.join(paths.build, `preview/${name}`), 
      lores.image
    )

  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
