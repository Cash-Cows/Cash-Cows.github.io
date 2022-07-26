//to run this on testnet:
// $ npx hardhat run scripts/allow.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const whitelist = require('../data/allowlist.json') 
const privateKey = process.env.privateKey;

// function authorize(recipient, maxMint = 9, maxFree = 5) {
function authorize(recipient, maxMint = 9, maxFree = 1) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['mint', recipient, maxMint, maxFree]
    ).slice(2),
    'hex'
  )
}

async function main() {
  //sign message wallet PK
  const wallet = hardhat.config.networks[hardhat.config.defaultNetwork].accounts[0]
  const signer = new ethers.Wallet(wallet)

  const authorized = {}

  //make a message
  for (let i = 0; i < whitelist.length; i++) {
    let address = whitelist[i]
    let maxFree = 0
    let maxMint = 9
    const message = authorize(address, maxMint, maxFree)
    authorized[address.toLowerCase()] = await signer.signMessage(message)
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../docs/data/allowed.json'),
    JSON.stringify(authorized, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
