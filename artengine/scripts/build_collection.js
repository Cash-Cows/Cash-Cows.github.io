const fs = require('fs')
const path = require('path')
const cid = require('ipfs-only-hash')
const { createCanvas, loadImage } = require('canvas');
const { 
  paths, 
  add_preview,
  preview,
  image,
  start_edition,
  cid_version,
  smoothing,
  metadata_template,
  layers,
  default_blend,
  default_opacity,
  shuffle_layers
} = require('../config/engine')

const METADATA_STANDARDS = [
  'name', 
  'description', 
  'image', 
  'preview',
  'external_url', 
  'animation_url'
]

function purge() {
  if (!fs.existsSync(paths.build)) {
    fs.mkdirSync(paths.build)
  }
  //remove if json folder exists
  if (fs.existsSync(path.join(paths.build, 'json'))) {
    fs.rmSync(path.join(paths.build, 'json'), { recursive: true })
  }
  //remove if image folder exists
  if (fs.existsSync(path.join(paths.build, 'image'))) {
    fs.rmSync(path.join(paths.build, 'image'), { recursive: true })
  }
  fs.mkdirSync(path.join(paths.build, 'image'))
  fs.mkdirSync(path.join(paths.build, 'json'))
  if (add_preview) {
    //remove if preview folder exists
    if (fs.existsSync(path.join(paths.build, 'preview'))) {
      fs.rmSync(path.join(paths.build, 'preview'), { recursive: true })
    }

    fs.mkdirSync(path.join(paths.build, 'preview'))
  }
}

async function chooseAttributes(layers) {
  const attributes = []
  let no = []
  for (const layer of layers) {
    let totalWeight = 0
    for (const attribute in layer.attributes) {
      totalWeight += layer.attributes[attribute].weight
    }
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight)
    for (const attribute in layer.attributes) {
      if (!layer.attributes[attribute].weight) {
        continue
      }
      if (no.indexOf(layer.attributes[attribute].id) !== -1) {
        continue
      }

      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.attributes[attribute].weight
      if (random < 0) {
        layer.attributes[attribute].name = layer.name
        layer.attributes[attribute].value = attribute
        layer.attributes[attribute].blend = layer.attributes[attribute].blend || layer.blend
        layer.attributes[attribute].opacity = layer.attributes[attribute].opacity || layer.opacity
        layer.attributes[attribute].resources = [
          await loadImage(path.join(paths.root, layer.attributes[attribute].paths[0])),
          await loadImage(path.join(paths.root, layer.attributes[attribute].paths[1])),
          await loadImage(path.join(paths.root, layer.attributes[attribute].paths[2]))
        ]

        if (layer.visible === false) {
          layer.attributes[attribute].visible = false  
        }
        attributes.push(layer.attributes[attribute])

        if (Array.isArray(layer.attributes[attribute].no)) {
          no = no.concat(layer.attributes[attribute].no)
        }
        break
      }
    }
  }

  if (attributes.length !== layers.length) {
    return await chooseAttributes(layers)
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

function generateMetadata(config, edition, level, hires, lores, attributes) {
  //generate the json
  const metadata = Object.assign({}, metadata_template, {
    edition,
    dna: hires.cid,
    date: Date.now(),
    attributes: Array.from(config.attributes || [])
  })
  //replace template strings
  METADATA_STANDARDS.forEach(key => {
    if (metadata[key]) {
      metadata[key] = metadata[key]
        .replace(/\{SERIES\}/, config.series)
        .replace(/\{EDITION\}/, edition)
        .replace(/\{LORES_CID\}/, lores.cid)
        .replace(/\{HIRES_CID\}/, hires.cid)
    }
  })
  //add attributes
  metadata.attributes.push({ trait_type: 'Crew', value: config.series })
  metadata.attributes.push({ trait_type: 'Level', value: level })
  for (const attribute of attributes) {
    if (!attribute.visible) {
      continue
    }
    metadata.attributes.push({
      trait_type: attribute.name,
      value: attribute.value
    })
  }

  return metadata
}

async function main() {
  let size = 0
  let limit = 0
  let total = 0
  const images = []
  const exists = new Set()
  for (const set of layers) {
    total += set.limit
  }

  console.log(`Total Items: ${total}`)

  for (const set of layers) {
    //add limit
    limit += set.limit
    //get features
    const features = require(path.join(paths.config, `${set.config}.json`))
    //save set layers
    set.layers = features.map(layer => {
      layer.blend = layer.blend || default_blend
      layer.opacity = layer.opacity || default_opacity
      return layer
    })

    while (size < limit) {
      //choose some random attributes and make a unique DNA
      const attributes = await chooseAttributes(set.layers)
      const exist = JSON.stringify(attributes)
      //if exists
      if (exists.has(exist)) {
        console.log('Chosen attributes exist, trying again.')
        continue
      }
      //add to images
      images.push({ set, attributes })
      //add to the exists list
      exists.add(exist)
      //increase size
      size++
      //report
      console.log('Added', size)
    }
  }

  if (shuffle_layers) {
    //randomized image order
    images.sort(() => Math.random() - 0.5)
  }
  
  //purge old files
  purge()
  const lores = makeCanvas(preview)
  const hires = makeCanvas(image)
  for (let i = 0; i < images.length; i++) {
    const edition = i + start_edition
    const attributes = images[i].attributes
    for (let j = 0; j < 3; j++) {
      //generate the image (this sets ctx, which is controlled by canvas)
      await drawImage(lores, j, attributes)
      await drawImage(hires, j, attributes)
      //make metadata
      const metadata = generateMetadata(images[i].set, edition, j + 1, hires, lores, attributes)
      //save
      console.log('Saving', `${edition}_${j}`, images[i].set.config, hires.cid)
      if (add_preview) {
        //save preview
        fs.writeFileSync(
          path.join(paths.build, `preview/${edition}_${j}.png`), 
          lores.image
        )
      }
      //save image
      fs.writeFileSync(
        path.join(paths.build, `image/${edition}_${j}.png`), 
        hires.image
      )
      //save json
      fs.writeFileSync(
        path.join(paths.build, `json/${edition}_${j}.json`), 
        JSON.stringify(metadata, null, 2)
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