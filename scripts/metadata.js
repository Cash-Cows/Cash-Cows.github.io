//to run this on testnet:
// $ npx hardhat run scripts/metadata.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const database = require('../docs/data/metadata.json')

class TaskRunner {
  constructor(maxThreads = 1, sleep = 300) {
    this.maxThreads = maxThreads
    this.sleep = sleep
  }

  thread(resolve, error) {
    //if queue is empty
    if (!this.queue.length) return resolve()
    //run task
    const task = this.queue.shift()
    task().then(_ => {
      setTimeout(() => {
        //otherwise, move on to the next one
        this.thread(resolve, error)
      }, this.sleep)
      
    }).catch(e => { error(e) })
  }

  run(error) {
    return new Promise(resolve => {
      for (let i = 0; i < this.maxThreads; i++) {
        this.thread(resolve, error)
      }
    })
  }
}

async function bindContract(key, name, contract, signers) {
  //attach contracts
  for (let i = 0; i < signers.length; i++) {
    const Contract = await ethers.getContractFactory(name, signers[i]);
    signers[i][key] = await Contract.attach(contract);
  }

  return signers;
}

function reset() {
  database.rows.forEach(row => (delete row.attributes.Level))
}

async function main() {
  const network = hardhat.config.defaultNetwork
  const config = hardhat.config.networks[network]
  const signers = await hardhat.ethers.getSigners();
  await bindContract('withNFT', 'CashCows', config.contracts.nft, signers)
  await bindContract('withData', 'CashCowsMetadata', config.contracts.metadata, signers)

  const burned = []

  reset()
  const runner = new TaskRunner(25, 0)
  runner.queue = database.rows.map(row => async _ => {
    if (typeof row.attributes.Level !== 'undefined') return
    let stage = -1
    try {
      await signers[1].withNFT.ownerOf(row.edition)
      stage = await signers[1].withData.stage(row.edition)
    } catch(e) {
      burned.push(row.edition)
    }
    
    row.attributes.Level = parseInt(stage) + 1
    console.log(row.edition, row.attributes.Level)

    fs.writeFileSync(
      path.resolve(__dirname, '../docs/data/metadata.json'),
      JSON.stringify(database, null, 2)
    )
  })

  await runner.run(error => {})
  database.updated = Date.now()
  database.supply = database.rows.length - burned.length
  fs.writeFileSync(
    path.resolve(__dirname, '../docs/data/metadata.json'),
    JSON.stringify(database, null, 2)
  )
  console.log('burned', burned)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
