//to run this on testnet:
// $ npx hardhat run scripts/crewdata.js

const hardhat = require('hardhat')

const fs = require('fs')
const path = require('path')

const database = require('../data/crew.json')
const milkRates = require('../data/milk.json')
const dollaRates = require('../data/dolla.json')
const loots = require('../data/loot.json')
const discounts = require('../data/discounts.json')

const zero = '0x0000000000000000000000000000000000000000'
const networks = [ 'goerli', 'ethereum' ]

function parseBigInt(str, base = 10) {
  base = BigInt(base)
  var bigint = BigInt(0)
  for (var i = 0; i < str.length; i++) {
    var code = str[str.length - 1 - i].charCodeAt(0) - 48; if(code >= 10) code -= 39
    bigint += base**BigInt(i) * BigInt(code)
  }
  return bigint
}

function getCollectionId(address, id, base = 10) {
  address = address.replace('0x', '').toLowerCase();
  const addressBin = [];
  for(var c of address) {
    switch(c) {
      case '0': addressBin.push('0000'); break;
      case '1': addressBin.push('0001'); break;
      case '2': addressBin.push('0010'); break;
      case '3': addressBin.push('0011'); break;
      case '4': addressBin.push('0100'); break;
      case '5': addressBin.push('0101'); break;
      case '6': addressBin.push('0110'); break;
      case '7': addressBin.push('0111'); break;
      case '8': addressBin.push('1000'); break;
      case '9': addressBin.push('1001'); break;
      case 'a': addressBin.push('1010'); break;
      case 'b': addressBin.push('1011'); break;
      case 'c': addressBin.push('1100'); break;
      case 'd': addressBin.push('1101'); break;
      case 'e': addressBin.push('1110'); break;
      case 'f': addressBin.push('1111'); break;
      default: return '';
    }
  }

  return parseBigInt([
    id.toString(2).padStart(192, '0'),
    addressBin.join('').padStart(160, '0')
  ].join(''), 2).toString(base)
}

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

function getOccurances(database) {
  //count occurances
  const occurances = {}
  for (const row of database) {
    for (const trait in row.attributes) {
      const value = row.attributes[trait].value
      if (!occurances[trait]) occurances[trait] = {}
      if (!occurances[trait][value]) occurances[trait][value] = 0
      if (row.attributes.Level.value > 0) occurances[trait][value]++
    }
  }

  return occurances
}

function addRanks(database, occurances) {
  //add occurance and score to each
  for (const row of database) {
    row.score = 0
    for (const trait in row.attributes) {
      const value = row.attributes[trait].value
      const occurance = occurances[trait][value]
      row.attributes[trait] = {
        value: value,
        score: 1 / (occurance / database.length),
        occurances: occurance
      }
      row.score += row.attributes[trait].score
    }

    row.score += row.attributes.Level.value * 1000
    if (row.attributes.Level == 0) {
      row.score = 0
    }
  }

  //now we need to determine each rank
  let rank = 1
  const ranked = database.slice().sort((a, b) => b.score - a.score)
  ranked.forEach((row, i) => {
    row.rank = i == 0 
      || Math.floor(ranked[i - 1].score * 100) == Math.floor(row.score * 100) 
      ? rank
      : ++rank
  })
}

async function addRates(row, config) {
  const signer = new ethers.Wallet(config.accounts[0])
  const nft = { address: config.contracts.nft }
  const milk = { address: config.contracts.milk }
  const dolla = { address: config.contracts.dolla }

  row.rates = {}

  const crew = row.attributes.Crew.value

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
}

async function addLoot(row, network, config) {
  const signer = new ethers.Wallet(config.accounts[0])

  const crew = row.attributes.Crew.value

  row.loot = {}

  for (const item of loots) {
    //continue
    const type = item.attributes.Type

    row.loot[item.edition] = {}
    for (const token in item.networks[network].pricing) {
      const price = ethers.BigNumber
        .from(item.networks[network].pricing[token])
        .mul(ethers.BigNumber.from(String(discounts[crew][type])))
        .div(ethers.BigNumber.from('100'))
        .toString()

      const proof = token === zero
        ? await signer.signMessage(
          authorizeEthPrice(row.characterId, item.networks[network].itemId, price)
        ): await signer.signMessage(
          authorizeDollaPrice(token, row.characterId, item.networks[network].itemId, price)
        )
      row.loot[item.edition][token] = { price, proof }
    }
  }
}

async function main() {
  const occurances = getOccurances(database)
  addRanks(database, occurances)

  for (let i = 0; i < database.length; i++) {
    database[i] = {
      edition: database[i].edition,
      score: database[i].score,
      rank: database[i].rank,
      images: database[i].images,
      attributes: database[i].attributes,
      networks: {}
    }
  }

  for (const network of networks) {
    const config = hardhat.config.networks[network]
    const nft = { address: config.contracts.nft }

    const crew = path.resolve(__dirname, `../docs/${network}/data/crew`)
    if (fs.existsSync(crew)) {
      fs.rmSync(crew, { recursive: true })
    }
    fs.mkdirSync(crew)

    for (let i = 0; i < database.length; i++) {
      const row = Object.assign({}, database[i])
      console.log(network, row.edition)
      row.characterId = getCollectionId(nft.address, row.edition)

      await addRates(row, config)
      await addLoot(row, network, config)

      fs.writeFileSync(
        path.resolve(__dirname, `../docs/${network}/data/crew/${row.edition}.json`),
        JSON.stringify({
          edition: row.edition,
          characterId: row.characterId,
          score: row.score,
          rank: row.rank,
          images: row.images,
          attributes: row.attributes,
          rates: row.rates,
          loot: row.loot
        }, null, 2)
      )

      database[i].networks[network] = {
        characterId: row.characterId,
        rates: row.rates,
        loot: row.loot
      }
    }

    fs.writeFileSync(
      path.resolve(__dirname, `../docs/${network}/data/crew.json`),
      JSON.stringify({
        updated: Date.now(),
        supply: database.length,
        occurances: occurances,
        rows: database.map(row => ({
          edition: row.edition,
          score: row.score,
          rank: row.rank,
          images: row.images,
          attributes: row.attributes
        }))
      }, null, 2)
    )
  }

  fs.writeFileSync(
    path.resolve(__dirname, `../data/crew.json`),
    JSON.stringify(database, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});