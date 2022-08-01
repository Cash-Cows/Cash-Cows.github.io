//to run this on testnet:
// $ npx hardhat run scripts/phase1/2-deploy-treasury.js

const hardhat = require('hardhat')

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await hardhat.ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

async function main() {
  //get network and admin
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const nft = { address: network.contracts.nft }

  console.log('Deploying CashCowsTreasury ...')
  const treasury = await deploy('CashCowsTreasury', nft.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsTreasury deployed to:', treasury.address)
  console.log('')
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    treasury.address,
    `"${nft.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In contract.json, add treasury')
  console.log(` - "fee_recipient": "${treasury.address}"`)
  console.log(' - Upload to IPFS')
  console.log('In CashCows contract, update contract URI')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - setURI( ipfs://... )`)
  console.log('In CashCows contract, update treasury')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - updateTreasury( ${treasury.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});