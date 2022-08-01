const fs = require('fs-extra')
const path = require('path')
const Bottleneck = require('bottleneck')

const { paths, add_preview } = require('../config/engine')
const CACHE_FILE = path.join(paths.cache, '.nft.storage.json')
if (!fs.existsSync(paths.cache)) {
  fs.mkdirSync(paths.cache)
}

const uploaded = fs.existsSync(CACHE_FILE)? fs.readJsonSync(CACHE_FILE): {}
const rateLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 3000 })

async function uploadBuildImages(client, datalist) {
  const previews = path.resolve(paths.build, 'preview')
  const images = path.resolve(paths.build, 'images')
  const jsons = path.resolve(paths.build, 'json')
  if (!fs.existsSync(images)) {
    throw new Error('build/images folder missing')
  } else if (!fs.existsSync(jsons)) {
    throw new Error('build/json folder missing')
  }

  //loop through image files
  const files = await fs.promises.readdir(images)
  for( const name of files ) {
    const image = path.join(images, name)
    const imageStat = await fs.promises.stat( image )
    //if not a file
    if(!imageStat.isFile()) {
      console.error(`Skipping ${name}, not a file`)
      continue
    //if not a png
    } else if (path.extname(image) !== '.png') {
      console.error(`Skipping ${name}, not a png`)
      continue
    }

    const json = path.join(jsons, `${path.basename(name, '.png')}.json`)
    const preview = path.join(previews, name)
    //if file doesnt exist
    if (!fs.existsSync(json)) {
      console.error(`Skipping ${name}, no matching ${path.basename(name, '.png')}.json found`)
      continue
    } else if (add_preview && !fs.existsSync(preview)) {
      console.error(`Skipping ${name}, no matching preview found`)
      continue
    }

    if (!uploaded[image]) {
      const { dna } = require(json)
      //upload image
      uploaded[image] = await rateLimiter.schedule(() => client.storeBlob(new Blob([
        await fs.promises.readFile(image)
      ])))
      if (uploaded[image] !== dna) {
        console.error(`Uploaded ${uploaded[image]} does not match IPFS ${dna}`)
        continue
      }

      //upload preview
      if (add_preview) {
        if (!uploaded[preview]) {
          uploaded[preview] = await rateLimiter.schedule(() => client.storeBlob(new Blob([
            await fs.promises.readFile(preview)
          ])))
        }
      }

      fs.writeFileSync(CACHE_FILE, JSON.stringify(uploaded, null, 2))
    }

    datalist.push(new File(
      [await fs.promises.readFile(json)], 
      path.basename(json)
    ))
  }
}

const { NFTStorage, File, Blob } = require('nft.storage')
require('dotenv').config()

async function main() {
  const datalist = []
  const client = new NFTStorage({ token: process.env.NFT_STORAGE })
  await uploadBuildImages(client, datalist)

  console.log('Uploading all json...')
  const cid = await client.storeDirectory(datalist)
  console.log(`JSON folder found in https://ipfs.io/ipfs/${cid}`)
  console.log('Done!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
