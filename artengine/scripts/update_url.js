const fs = require('fs-extra')
const path = require('path')

const { paths } = require('../config/engine')

async function main() {
  const json = path.resolve(paths.build, 'json')
  if (!fs.existsSync(json)) throw new Error('build/json folder missing')
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

    console.log(`Updating ${name}`)

    const data = require(dataPath)
    data.external_url = `https://www.cashcows.club/ethereum/crew/${data.edition}/profile.html`
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
