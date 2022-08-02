//to run this on testnet:
// $ npx hardhat run scripts/metadata.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const database = require('../docs/data/metadata.json')

async function main() {
  const network = hardhat.config.defaultNetwork
  const config = hardhat.config.networks[network]
  const admin = new hardhat.ethers.Wallet(config.accounts[0])
  const address = {
    nft: config.contracts.nft,
    metadata: config.contracts.token
  }

  const contract = {
    nft: await (
      await hardhat.ethers.getContractFactory('CashCows', admin)
    ).attach(address.nft),
    metadata: await (
      await hardhat.ethers.getContractFactory('CashCowsMetadata', admin)
    ).attach(address.nft)
  }

  for(const row of database) {
    //const stage = parseInt()
    console.log(await contract.metadata.stage(row.edition))
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
