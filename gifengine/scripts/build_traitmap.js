const fs = require('fs-extra')
const path = require('path')

const { paths } = require('../config/engine')

function parseBigInt(str, base = 10) {
  base = BigInt(base)
  var bigint = BigInt(0)
  for (var i = 0; i < str.length; i++) {
    var code = str[str.length - 1 - i].charCodeAt(0) - 48; if(code >= 10) code -= 39
    bigint += base**BigInt(i) * BigInt(code)
  }
  return bigint
}

async function main() {
  const json = path.resolve(paths.build, 'json')
  if (!fs.existsSync(json)) throw new Error('build/json folder missing')

  let id = 0
  const traitmap = {}
  for (i = 0; i < 4030; i++) {
    const metadata = require(path.join(json, `${i + 1}_0.json`))
    metadata.attributes.filter(
      trait => trait.trait_type !== 'Level'
    ).forEach(trait => {
      //if there is already an id
      if (traitmap[trait.trait_type] && traitmap[trait.trait_type][trait.value]) return
      if (!traitmap[trait.trait_type]) traitmap[trait.trait_type] = {}
      traitmap[trait.trait_type][trait.value] = ++id
    })
  }

  //renumber everything
  id = 0
  for (const trait in traitmap) {
    for (const value in traitmap[trait]) {
      traitmap[trait][value] = ++id
    }
  }

  fs.writeFileSync(
    path.join(paths.build, 'traitmap.json'), 
    JSON.stringify(traitmap, null, 2)
  )

  //next generate trait ids
  const tokens = []
  const order = Object.keys(traitmap)
  for (i = 0; i < 4030; i++) {
    let traitId = []
    const metadata = require(path.join(json, `${i + 1}_0.json`))
    order.forEach(name => {
      metadata.attributes.filter(
        trait => trait.trait_type !== 'Level'
      ).forEach(trait => {
        if (name !== trait.trait_type) return
        traitId.push(traitmap[name][trait.value].toString(2).padStart(8, '0'))
      })
    })
    tokens.push(parseBigInt(traitId.join(''), 2).toString())
  }

  fs.writeFileSync(
    path.join(paths.build, 'traitids.json'), 
    JSON.stringify(tokens, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
