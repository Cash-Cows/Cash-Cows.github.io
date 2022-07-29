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

const CACHE_FILE = path.join(process.cwd(), '.artengine/.infura_json.json')
const TOOL_FILE = '/Users/cblanquera/server/tools/ipfs'
const JSON_FOLDER = path.join(process.cwd(), 'artengine/build/json')
const uploaded = fs.existsSync(CACHE_FILE)? fs.readJsonSync(CACHE_FILE): {}
const rateLimiter = new Bottleneck({ maxConcurrent: 50, minTime: 333 })

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
      const json = path.join(JSON_FOLDER, `${i + 1}_${j}.json`)

      if (uploaded[json]) {
        continue
      }

      rateLimiter.schedule(() => exec([
        TOOL_FILE,
        `--id ${keys.key}`,
        `--secret ${keys.secret}`,
        json
      ].join(' '))).then(cid => {
        uploaded[json] = cid.replace('/ipfs/', '').replace("\n", '')
        fs.writeFileSync(CACHE_FILE, JSON.stringify(uploaded, null, 2))
        console.log(`${i + 1}_${j}.json -> https://cashcows.infura-ipfs.io/ipfs/${uploaded[json]}`)
      })
    }
  }

  await exec([
    TOOL_FILE,
    `--id ${keys.key}`,
    `--secret ${keys.secret}`,
    JSON_FOLDER
  ].join(' '))
})()