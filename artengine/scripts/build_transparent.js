const fs = require('fs-extra')
const path = require('path')
const cid = require('ipfs-only-hash')
const { createCanvas, loadImage } = require('canvas');
const { 
  paths, 
  image,
  start_edition,
  cid_version,
  smoothing,
  layers,
  default_blend,
  default_opacity
} = require('../config/engine')

async function getLayersMap() {
  const map = {}
  const layers = require(path.join(paths.config, 'layers.json'))
  for (const layer of layers) {
    for (const attribute in layer.attributes) {
      layer.attributes[attribute].name = layer.name
      layer.attributes[attribute].value = attribute
      layer.attributes[attribute].blend = default_blend
      layer.attributes[attribute].opacity = default_opacity
      layer.attributes[attribute].resources = [
        await loadImage(path.join(paths.root, layer.attributes[attribute].paths[0])),
        await loadImage(path.join(paths.root, layer.attributes[attribute].paths[1])),
        await loadImage(path.join(paths.root, layer.attributes[attribute].paths[2]))
      ]
    }
    map[layer.name] = layer
  }
  return map
}

async function loadAttributes(edition, map) {
  const metadata = require(path.join(paths.build, `json/${edition}_0.json`))
  const attributes = []
  for (const trait of metadata.attributes) {
    if (trait.trait_type === 'Background') continue
    if (!map[trait.trait_type]?.attributes[trait.value]) continue
    attributes.push(map[trait.trait_type].attributes[trait.value])
  }

  return attributes
}

function makeCanvas(dimensions) {
  const area = createCanvas(dimensions.width, dimensions.height)
  const ctx = area.getContext('2d')
  ctx.imageSmoothingEnabled = smoothing
  return { dimensions, area, ctx }
}

async function drawImage(canvas, stage, attributes) {
  canvas.ctx.clearRect(
    0, 
    0, 
    canvas.dimensions.width, 
    canvas.dimensions.height
  )
  for (const attribute of attributes) {
    canvas.ctx.globalAlpha = attribute.opacity
    canvas.ctx.globalCompositeOperation = attribute.blend
    canvas.ctx.drawImage(
      attribute.resources[stage], 
      0, 
      0, 
      canvas.dimensions.width, 
      canvas.dimensions.height
    )
  }
  canvas.image = canvas.area.toBuffer('image/png')
  canvas.cid = await cid.of(canvas.image, { cidVersion: cid_version })
}

async function main() {
  const map = await getLayersMap()
  let total = 0
  for (const set of layers) total += set.limit

  const images = []
  for (let i = 0; i < total; i++) {
    //add to images
    images.push(await loadAttributes(i + 1, map))
    console.log('Added', i + 1)
  }

  //remove if transparent folder exists
  if (fs.existsSync(path.join(paths.build, 'transparent'))) {
    //fs.rmSync(path.join(paths.build, 'transparent'), { recursive: true })
  }
  //fs.mkdirSync(path.join(paths.build, 'transparent'))

  const canvas = makeCanvas(image)
  for (let i = 0; i < images.length; i++) {
    const edition = i + start_edition
    const attributes = images[i]
    for (let j = 0; j < 3; j++) {
      //generate the image (this sets ctx, which is controlled by canvas)
      await drawImage(canvas, j, attributes)
      //save
      console.log('Saving', `${edition}_${j}`)
      //save image
      fs.writeFileSync(
        path.join(paths.build, `transparent/${edition}_${j}.png`), 
        canvas.image
      )
    }
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
