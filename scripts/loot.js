//to run this on testnet:
// $ node scripts/loot.js

const fs = require('fs')
const path = require('path')

const loots = require('../data/loots.json')

async function main() {
  const metadata = []
  for (let i = 0; i < loots.length; i++) {
    const attributes = []
    for (const trait in loots[i].attributes) {
      attributes.push({
        trait_name: trait,
        value: loots[i].attributes[trait]
      })
    }
    const loot = {
      name: loots[i].name,
      image: loots[i].peg,
      edition: i + 1,
      category: loots[i].category,
      attributes: attributes
    }

    metadata.push(loot)
    
    fs.writeFileSync(
      path.resolve(__dirname, `../docs/data/loot/${String(i + 1).padStart(64, '0')}.json`),
      JSON.stringify(loot, null, 2)
    )
    fs.writeFileSync(
      path.resolve(__dirname, `../server/src/data/loot/${String(i + 1).padStart(64, '0')}.json`),
      JSON.stringify(loot, null, 2)
    )
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../docs/data/loot.json`),
    JSON.stringify(metadata, null, 2)
  )
  fs.writeFileSync(
    path.resolve(__dirname, `../server/src/data/loot.json`),
    JSON.stringify(metadata, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});