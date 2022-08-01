//to run this on testnet:
// $ npx hardhat run scripts/phase1/3-deploy-metadata.js

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
  const treasury = { address: network.contracts.treasury }

  console.log('Deploying CashCowsMetadata ...')
  const metadata = await deploy('CashCowsMetadata')

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsMetadata deployed to:', metadata.address)
  console.log('')
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    metadata.address
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCowsMetadata contract, set treasury')
  console.log(` - ${network.scanner}/address/${metadata.address}#writeContract`)
  console.log(` - setTreasury( ${treasury.address} )`)
  console.log('In CashCowsMetadata contract, set stages')
  console.log(` - ${network.scanner}/address/${metadata.address}#writeContract`)
  console.log(` - setStage( 0, 1000000000000000 ) //--> 0.001`)
  console.log(` - setStage( 1, 5000000000000000 ) //--> 0.005`)
  console.log(` - setStage( 2, 10000000000000000 ) //--> 0.01`)
  console.log('In CashCows contract, update metadata (on reveal)')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - setMetadata( ${metadata.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});