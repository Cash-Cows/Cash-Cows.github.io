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

  console.log('Deploying Royalty4All ...')
  const treasury = await deploy('Royalty4All', nft.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('Royalty4All deployed to:', treasury.address)
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