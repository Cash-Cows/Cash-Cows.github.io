// $ node scripts/infura.js

const fs = require('fs-extra')
const path = require('path')
const Bottleneck = require('bottleneck')
const { exec: _exec } = require('child_process')

require('dotenv').config()
const keys = {
  key: process.env.INFURA_API_KEY,
  secret: process.env.INFURA_API_SECRET
}

const CACHE_FILE = path.join(process.cwd(), '.artengine/.infura.json')
const TOOL_FILE = '/Users/cblanquera/server/tools/ipfs'
const JSON_FOLDER = path.join(process.cwd(), 'artengine/build/json')
const IMAGE_FOLDER = path.join(process.cwd(), 'artengine/build/image')
const uploaded = fs.existsSync(CACHE_FILE)? fs.readJsonSync(CACHE_FILE): {}
const rateLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 3000 })

const exec = command => {
  return new Promise((resolve, reject) => {
    _exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      } else if (stderr) {
        return reject(stderr);
      } else {
        return resolve(stdout);
      }
    });
  })
}

(async _ => {
  for (let i = 0; i < 7777; i++) {
    for (let j = 0; j < 3; j++) {
      const image = path.join(IMAGE_FOLDER, `${i + 1}_${j}.png`)

      if (uploaded[image]) {
        continue
      }

      console.log(`Uploading ${i + 1}_${j}.png`)
      uploaded[image] = await rateLimiter.schedule(() => exec([
        TOOL_FILE,
        `--id ${keys.key}`,
        `--secret ${keys.secret}`,
        image
      ].join(' ')))

      uploaded[image] = uploaded[image].replace('/ipfs/', '').replace("\n", '')
      console.log(`https://cashcows.infura-ipfs.io/ipfs/${uploaded[image]}`)
      fs.writeFileSync(CACHE_FILE, JSON.stringify(uploaded, null, 2))
    }
  }

  await exec([
    TOOL_FILE,
    `--id ${keys.key}`,
    `--secret ${keys.secret}`,
    JSON_FOLDER
  ].join(' '))
})()