const path = require('path')
const fs = require('fs-extra')
const FormData = require('form-data')
const axios = require('axios')
const { Readable } = require('stream');
const { paths, cid_version } = require('../config/engine')

require('dotenv').config()
const { INFURA_API_KEY, INFURA_API_SECRET } = process.env

const infura = axios.create({ 
  baseURL: 'https://ipfs.infura.io:5001/api/v0',
  maxContentLength: Infinity,
  maxBodyLength: Infinity  
});

const CACHE_FILE = path.join(paths.cache, '.infura.json')

if (!fs.existsSync(paths.cache)) {
  fs.mkdirSync(paths.cache)
}

async function main() {
  const json = path.resolve(paths.build, 'json')
  if (!fs.existsSync(json)) throw new Error('build/json folder missing')

  //make a form
  const form = new FormData()

  const files = await fs.promises.readdir(json)
  for( const name of files ) {
    const dataPath = path.join(json, name)
    const dataStat = await fs.promises.stat(dataPath)
    //if not a file
    if(!dataStat.isFile()) {
      console.error(`Skipping ${name}, not a file`)
      continue
    //if not a png
    } else if (path.extname(dataPath) !== '.json') {
      console.error(`Skipping ${name}, not a json`)
      continue
    }

    form.append('file', fs.readFileSync(dataPath), name)
  }

  //upload animation to CDN/IPFS
  const response = await infura.post('/add?wrap-with-directory=true', form, {
    headers: { 
      ...form.getHeaders(), 
      //'content-length': form.getLengthSync(),
      authorization: `Basic ${
        Buffer
          .from(`${INFURA_API_KEY}:${INFURA_API_SECRET}`)
          .toString('base64')
      }`
    }
  });

  console.log(response.data)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})