//to run this on testnet:
// $ npx hardhat run scripts/metadata.js

const hardhat = require('hardhat')

const fs = require('fs')
const path = require('path')

const database = require('../data/metadata.json')
const milkRates = require('../data/milk.json')
const dollaRates = require('../data/dolla.json')
const loots = require('../data/loots.json')
const discounts = require('../data/discounts.json')

function authorizeMilkRate(collection, tokenId, rate) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['release', collection, tokenId, rate]
    ).slice(2),
    'hex'
  )
}

function authorizeDollaRate(characterId, rate) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'uint256', 'uint256'],
      ['exchange', characterId, rate]
    ).slice(2),
    'hex'
  )
}

function authorizeEthPrice(characterId, itemId, price) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'uint256', 'uint256', 'uint256'],
      ['mint', characterId, itemId, price]
    ).slice(2),
    'hex'
  )
}

function authorizeDollaPrice(token, characterId, itemId, price) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256', 'uint256'],
      ['mint', token, characterId, itemId, price]
    ).slice(2),
    'hex'
  )
}

async function main() {
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const signer = new ethers.Wallet(network.accounts[0])
  const nft = { address: network.contracts.nft }
  const dolla = { address: network.contracts.dolla }

  for (let i = 0; i < database.length; i++) {
    const row = Object.assign({}, database[i])
    const crew = row.attributes.Crew

    row.milk = {
      rate: milkRates[crew],
      proof: await signer.signMessage(
        authorizeMilkRate(nft.address, row.edition, milkRates[crew])
      )
    }

    row.dolla = {
      rate: dollaRates[crew],
      proof: await signer.signMessage(
        authorizeDollaRate(row.characterId, dollaRates[crew])
      )
    }

    row.loot = {}
    for (const item of loots) {
      const type = item.attributes.Type
      const discount = discounts[crew][type] / 100
      const ethPrice = ethers.utils
        .parseEther(String(item.eth * discount))
        .toString()
      const dollaPrice = ethers.utils
        .parseEther(String(item.dolla * discount))
        .toString()

      row.loot[item.id] = {
        eth: {
          price: ethPrice,
          proof: await signer.signMessage(
            authorizeEthPrice(row.characterId, item.id, ethPrice)
          )
        },
        dolla: {
          price: dollaPrice,
          proof: await signer.signMessage(
            authorizeDollaPrice(dolla.address, row.characterId, item.id, dollaPrice)
          )
        }
      }
    }

    fs.writeFileSync(
      path.resolve(__dirname, `../docs/data/crew/${row.edition}.json`),
      JSON.stringify(row, null, 2)
    )
    fs.writeFileSync(
      path.resolve(__dirname, `../server/src/data/crew/${row.edition}.json`),
      JSON.stringify(row, null, 2)
    )
    database[i] = {
      edition: row.edition,
      characterId: row.characterId,
      images: row.images,
      attributes: row.attributes
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../docs/data/metadata.json'),
    JSON.stringify({
      updated: Date.now(),
      supply: database.length,
      rows: database
    }, null, 2)
  )
  fs.writeFileSync(
    path.resolve(__dirname, '../server/src/data/metadata.json'),
    JSON.stringify({
      updated: Date.now(),
      supply: database.length,
      rows: database
    }, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});