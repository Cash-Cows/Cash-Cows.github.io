const fs = require('fs-extra')
const path = require('path')

const { paths, layers } = require('../config/engine')

async function main() {
  const json = path.resolve(paths.build, 'json')
  if (!fs.existsSync(json)) throw new Error('build/json folder missing')
  
  let total = 0
  for (const set of layers) total += set.limit

  const metadata = []
  for (i = 0; i < total; i++) {
    //check image
    const level1 = require(path.join(json, `${i + 1}_0.json`))
    const level2 = require(path.join(json, `${i + 1}_1.json`))
    const level3 = require(path.join(json, `${i + 1}_2.json`))

    const attributes = {}

    level1.attributes.filter(
      trait => trait.trait_type !== 'Level'
    ).forEach(trait => {
      attributes[trait.trait_type] = trait.value
    });

    metadata.push({
      edition: level1.edition,
      images: [ level1.image, level2.image, level3.image ],
      attributes
    })
  }

  fs.writeFileSync(
    path.join(paths.build, 'metadata.json'), 
    JSON.stringify(metadata, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
