const fs = require('fs')
const path = require('path')

const layers = path.resolve(__dirname, '../layers')

async function main() {
  const folders = await fs.promises.readdir(layers)
  for (const folder of folders) {
    const layer = path.join(layers, folder)
    if (!fs.existsSync(layer) || !fs.lstatSync(layer).isDirectory()) {
      continue
    }

    const pngs = await fs.promises.readdir(layer)
    for (const png of pngs) {
      const trait = path.join(layers, folder, png)
      if (!fs.existsSync(trait) 
        || !fs.lstatSync(trait).isFile()
        || path.extname(trait) !== '.png'
      ) {
        continue
      }

      fs.mkdirSync(trait.replace('.png', ''))
      for (let i = 0; i < 150; i++) {
        fs.copyFileSync(trait, path.join(trait.replace('.png', ''), `${i + 1}.png`))
      }
      fs.unlinkSync(trait)
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})