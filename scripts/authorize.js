//to run this on testnet:
// $ npx hardhat run scripts/authorize.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const allowlist = require('../data/allowlist.json') 
const whitelist = require('../data/whitelist.json') 

// function compose(recipient, maxMint = 9, maxFree = 5)
function compose(recipient, maxMint = 9, maxFree = 1) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['mint', recipient, maxMint, maxFree]
    ).slice(2),
    'hex'
  )
}

const maxMint = 9
const chunk = 2
const start = 10
const proof = {}
const check = { whitelist: {}, allowlist: {} }

async function authorize(signer) {
  let free = 0
  for (let i = 0; i < whitelist.length; i++) {
    const [ address, maxFree ] = whitelist[i]
    const message = compose(address, maxMint, maxFree)
    const signature = await signer.signMessage(message)
    const key = address.substring(start, start + chunk).toLowerCase()
    if (!proof[key]) proof[key] = {}
    proof[key][address.toLowerCase()] = signature
    check.whitelist[address.toLowerCase()] = maxFree
    free += maxFree
  }
  return free
}

async function allow(signer) {
  for (let i = 0; i < allowlist.length; i++) {
    const address = allowlist[i]
    const message = compose(address, maxMint, 0)
    const signature = await signer.signMessage(message)
    const key = address.substring(start, start + chunk).toLowerCase()
    if (!proof[key]) proof[key] = {}
    proof[key][address.toLowerCase()] = signature
    check.allowlist[address.toLowerCase()] = true
  }
  return Object.keys(check.allowlist).length
}

async function main() {
  //sign message wallet PK
  const wallet = hardhat.config.networks[hardhat.config.defaultNetwork].accounts[0]
  const signer = new ethers.Wallet(wallet)
  
  const totals = {
    //paidmint: await allow(signer),
    freemint: await authorize(signer)
  }

  for (const key in proof) {
    fs.writeFileSync(
      path.resolve(__dirname, `../docs/data/proof/${key}.json`),
      JSON.stringify(proof[key], null, 2)
    )
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../docs/data/verified.json'),
    JSON.stringify(check, null, 2)
  )

  console.log(totals.freemint, 'free mints')
  //console.log(totals.paidmint, 'paid mints')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
