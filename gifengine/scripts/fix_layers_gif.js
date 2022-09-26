const fs = require('fs')
const path = require('path')

const background = path.resolve(__dirname, '../layers/0-Background')

const gifs = [
  'Casino#5',
  'Castle#5',
  'Farm#5',
  'Island#5',
  'Moon#5',
  'Office#5',
  'Treasures#5',
  'Vault#5'
]

async function main() {
  for (const gif of gifs) {
    const folder = path.join(background, gif)
    //fs.mkdirSync(folder)
    for (let i = 0; i < 150; i++) {
      const source = path.join(background, `${gif}_${(i % 3) + 1}.png`)
      const destination = path.join(folder, `${i + 1}.png`)
      //console.log(source, '=>', destination)
      fs.copyFileSync(source, destination)
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})