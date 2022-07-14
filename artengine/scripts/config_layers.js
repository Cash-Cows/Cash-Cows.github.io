const fs = require('fs')
const path = require('path')
const { paths, default_weight } = require('../config/engine')

async function isFile(file) {
  if (!fs.existsSync(file)) return false
  const stat = await fs.promises.stat(file)
  return stat.isFile()
}

async function isFolder(folder) {
  if (!fs.existsSync(folder)) return false
  const stat = await fs.promises.stat(folder)
  return !stat.isFile()
}

async function main() {
  const config = [];
  let id = 0
  if (!await isFolder(paths.layers)) throw new Error(`layers folder missing`)
  const traits = await fs.promises.readdir(paths.layers)
  for(const trait of traits) {
    //ex. [project]/layers/1-Body
    const attribute = path.resolve(paths.layers, trait)
    if (!await isFolder(attribute) || !/^\d+\-/.test(trait)) continue
    let [ order, name ] = trait.split('-', 2)
    const visible = name.indexOf('_') !== 0
    if (!visible) name = name.substring(1)
    config.push({ name, visible, order: parseInt(order), attributes: {} })
    const values = await fs.promises.readdir(attribute)
    //ex. /layers/mainnet/1-Body/Sample#13
    for(const folder of values) {
      if (await isFile(path.resolve(attribute, folder))) continue
      let [ value, weight ] = folder.split('#')
      const visible = value.indexOf('_') !== 0
      if (!visible) value = value.substring(1)
      config[config.length - 1].attributes[value] = {
        id: ++id,
        visible,
        paths: [
          path.join('/layers', trait, folder, '0.png'),
          path.join('/layers', trait, folder, '1.png'),
          path.join('/layers', trait, folder, '2.png')
        ],
        weight: parseInt(weight || default_weight)
      }
    }

    config.sort((a, b) => a.order - b.order)
  }

  fs.writeFileSync(
    path.join(paths.config, 'layers.json'), 
    JSON.stringify(config, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})