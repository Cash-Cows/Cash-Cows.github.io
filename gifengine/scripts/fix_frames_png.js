const fs = require('fs')
const path = require('path')

const layers = path.resolve(__dirname, '../layers')

async function main() {
  const layerFolders = await fs.promises.readdir(layers)
  for (const layerFolder of layerFolders) {
    const layer = path.join(layers, layerFolder)
    if (!fs.existsSync(layer) || !fs.lstatSync(layer).isDirectory()) {
      continue
    }

    const traitFolders = await fs.promises.readdir(layer)
    for (const traitFolder of traitFolders) {
      const trait = path.join(layer, traitFolder)
      if (!fs.existsSync(trait) || !fs.lstatSync(trait).isDirectory()) {
        continue
      }

      const pngs = await fs.promises.readdir(trait)
      for (let i = 0; i < pngs.length; i++) {
        const source = path.join(trait, pngs[i])
        if (!fs.existsSync(source) 
          || !fs.lstatSync(source).isFile()
          || path.extname(source) !== '.png'
        ) {
          continue
        }

        const base = path.basename(source, '.png')

        //if base is already a number
        if (/^[0-9]+$/.test(base)) {
          continue
        }

        const destination = path.join(trait, `${i + 1}.png`)

        //console.log(source)

        fs.renameSync(source, destination)
      }
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})