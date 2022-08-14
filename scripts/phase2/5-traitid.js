//to run this on testnet:
// $ npx hardhat run scripts/phase2/5-traitid.js

const hardhat = require('hardhat')

const fs = require('fs')
const path = require('path')
const database = require('../../docs/data/metadata.json')
const traitmap = require('../../docs/data/traitmap.json')

function authorize(collectionId, metadata) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      [ 'string', 'uint256', 'uint256' ],
      [ 'register', collectionId, metadata ]
    ).slice(2),
    'hex'
  )
}

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
  const wallet = hardhat.config.networks[hardhat.config.defaultNetwork].accounts[0]
  const signer = new ethers.Wallet(wallet)
  //next generate trait ids
  const order = Object.keys(traitmap)
  for (const row of database.rows) {
    const traitId = []
    order.forEach(name => {
      for (const trait in row.attributes) {
        if (trait != name || trait === 'Level') continue
        const value = row.attributes[trait]
        traitId.push(traitmap[name][value].toString(2).padStart(8, '0'))
      }
    })

    row.traitId = parseBigInt(traitId.reverse().join(''), 2).toString()
    row.signature = await signer.signMessage(
      authorize(row.collectionId, row.traitId)
    )
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../../docs/data/metadata.json'),
    JSON.stringify(database, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
