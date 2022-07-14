const path = require('path')
const fs = require('fs-extra')
const Bottleneck = require('bottleneck')
const pinataSDK = require('@pinata/sdk')
const FormData = require('form-data')
const { post } = require('axios')

const { paths, add_preview, cid_version } = require('../config/engine')

require('dotenv').config()
const PINATA_API_PINFILETOIPFS = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env
const CACHE_FILE = path.join(paths.cache, '.pinata.json')

if (!fs.existsSync(paths.cache)) {
  fs.mkdirSync(paths.cache)
}

const uploaded = fs.existsSync(CACHE_FILE)? fs.readJsonSync(CACHE_FILE): {}
const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)
const rateLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 3000 })

/**
 * Upload a file's data to Pinata and provide a metadata name for the file.
 * This fileName can be either the name of the file being uploaded, or any
 * name sufficent enough to identify the contents.
 *
 * @param {string} fileName the file name to use for the uploaded data
 * @param {string} filePath the path to the file to upload and pin to Pinata
 * @return {string} returns the IPFS hash (CID) for the uploaded file
 */
const uploadFile = async (fileName, filePath) => {
  const exists = !!uploaded[fileName]
  const ipfsHash = uploaded[fileName]
  
  if (exists) {
    console.log(`File '${fileName}' already exists; CID: ${ipfsHash}`)
    return ipfsHash
  }
  
  console.log(`${fileName} upload started`)
  const { IpfsHash } = await pinata.pinFileToIPFS(
    fs.createReadStream(filePath),
    {
      pinataMetadata: { name: fileName },
      pinataOptions: { cidVersion: cid_version }
    }
  )

  console.log(`${fileName} upload complete; CID: ${IpfsHash}`)
  return IpfsHash;
}

async function uploadBuildImages(datalist) {
  const previews = path.resolve(paths.build, 'preview')
  const images = path.resolve(paths.build, 'image')
  const jsons = path.resolve(paths.build, 'json')
  if (!fs.existsSync(images)) {
    throw new Error('build/image folder missing')
  } else if (!fs.existsSync(jsons)) {
    throw new Error('build/json folder missing')
  } else if (add_preview && !fs.existsSync(previews)) {
    throw new Error('build/preview folder missing')
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
      uploaded[image] = await rateLimiter.schedule(() => uploadFile(`hires-${name}`, image))
      if (uploaded[image] !== dna) {
        console.error(`Uploaded ${uploaded[image]} does not match IPFS ${dna}`)
        continue
      }
      //upload preview
      if (add_preview && !uploaded[preview]) {
        uploaded[preview] = await rateLimiter.schedule(() => uploadFile(`lores-${name}`, preview))
      }

      fs.writeFileSync(CACHE_FILE, JSON.stringify(uploaded, null, 2))
    }

    datalist.push({ path: json, name: path.basename(json) })
  }
}

async function main() {
  const datalist = []
  await uploadBuildImages(datalist)

  console.log('Uploading all json...')
  const formData = new FormData();
  datalist.forEach(metadata => {
    console.log(`Adding file: ${metadata.path}`)
    formData.append('file', fs.createReadStream(metadata.path), {
      filepath: metadata.name
    })
  })
  const {
    data: { IpfsHash: cid },
  } = await post(PINATA_API_PINFILETOIPFS, formData, {
    maxBodyLength: 'Infinity',
    headers: {
      // eslint-disable-next-line no-underscore-dangle
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  })
  console.log(`JSON folder found in https://ipfs.io/ipfs/${cid}`)
  console.log('Done!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})