//to run this on testnet:
// $ npx hardhat run scripts/metadata.js

const hardhat = require('hardhat')

const fs = require('fs')
const path = require('path')

const database = require('../data/metadata.json')
const milkRates = require('../data/milk.json')
const dollaRates = require('../data/dolla.json')
const loots = require('../data/loot.json')
const discounts = require('../data/discounts.json')

const zero = '0x0000000000000000000000000000000000000000'

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
  const network = hardhat.config.defaultNetwork
  const config = hardhat.config.networks[network]
  const signer = new ethers.Wallet(config.accounts[0])
  const nft = { address: config.contracts.nft }
  const milk = { address: config.contracts.milk }
  const dolla = { address: config.contracts.dolla }

  if (fs.existsSync(path.resolve(__dirname, `../docs/data/${network}/crew`))) {
    fs.rmSync(path.resolve(__dirname, `../docs/data/${network}/crew`), { recursive: true })
  }
  fs.mkdirSync(path.resolve(__dirname, `../docs/data/${network}/crew`))
  if (fs.existsSync(path.resolve(__dirname, `../server/src/data/${network}/crew`))) {
    fs.rmSync(path.resolve(__dirname, `../server/src/data/${network}/crew`), { recursive: true })
  }
  fs.mkdirSync(path.resolve(__dirname, `../server/src/data/${network}/crew`))

  for (let i = 0; i < database.length; i++) {
    const row = Object.assign({}, database[i])
    const crew = row.attributes.Crew

    row.rates = {}

    const milkRate = ethers.utils
      .parseUnits(String(milkRates[crew]))
      .div(60 * 60 * 24)
      .toString()

    row.rates[milk.address] = {
      rate: milkRate,
      proof: await signer.signMessage(
        authorizeMilkRate(nft.address, row.edition, milkRate)
      )
    }

    const dollaRate = ethers.utils
      .parseUnits(String(dollaRates[crew]))
      .toString()

    row.rates[dolla.address] = {
      rate: dollaRate,
      proof: await signer.signMessage(
        authorizeDollaRate(row.characterId, dollaRate)
      )
    }

    row.loot = {}
    for (const item of loots) {
      continue
      const type = item.attributes.Type

      row.loot[item.edition] = {}
      for (const token in item[network].pricing) {
        const price = ethers.BigNumber
          .from(item[network].pricing[token])
          .mul(ethers.BigNumber.from(String(discounts[crew][type])))
          .div(ethers.BigNumber.from('100'))
          .toString()

        const proof = token === zero
          ? await signer.signMessage(
            authorizeEthPrice(row.characterId, item.edition, price)
          ): await signer.signMessage(
            authorizeDollaPrice(token, row.characterId, item.edition, price)
          )
        row.loot[item.edition][token] = { price, proof }
      }
    }

    fs.writeFileSync(
      path.resolve(__dirname, `../docs/data/${network}/crew/${row.edition}.json`),
      JSON.stringify(row, null, 2)
    )
    fs.writeFileSync(
      path.resolve(__dirname, `../server/src/data/${network}/crew/${row.edition}.json`),
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