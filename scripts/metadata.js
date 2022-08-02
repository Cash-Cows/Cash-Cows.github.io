//to run this on testnet:
// $ npx hardhat run scripts/metadata.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const Bottleneck = require('bottleneck')
const database = require('../docs/data/metadata.json')

const rateLimiter = new Bottleneck({ maxConcurrent: 50, minTime: 0 })

async function bindContract(key, name, contract, signers) {
  //attach contracts
  for (let i = 0; i < signers.length; i++) {
    const Contract = await ethers.getContractFactory(name, signers[i]);
    signers[i][key] = await Contract.attach(contract);
  }

  return signers;
}

function reset() {
  database.forEach(row => (delete row.attributes.Level))
}

async function main() {
  const network = hardhat.config.defaultNetwork
  const config = hardhat.config.networks[network]

  const signers = await hardhat.ethers.getSigners();
  await bindContract('withNFT', 'CashCows', config.contracts.nft, signers)
  await bindContract('withData', 'CashCowsMetadata', config.contracts.metadata, signers)

  //reset()

  const wrapped = rateLimiter.wrap(row => {
    try {
      return signers[1].withData.stage(row.edition)  
    } catch(e) {
      return async _ => -1
    }
  })

  for (const row of database) {
    if (typeof row.attributes.Level !== 'undefined') continue
    const stage = await wrapped(row)
    row.attributes.Level = parseInt(stage) + 1
    console.log(row.edition, row.attributes.Level)

    fs.writeFileSync(
      path.resolve(__dirname, '../docs/data/metadata.json'),
      JSON.stringify(database, null, 2)
    )
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
