//to run this on testnet:
//$ npx hardhat run scripts/phase4/3-deploy-market.js

const hardhat = require('hardhat')

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await hardhat.ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

function getRole(name) {
  if (!name || name === 'DEFAULT_ADMIN_ROLE') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  return '0x' + Buffer.from(
    hardhat.ethers.utils.solidityKeccak256(['string'], [name]).slice(2)
    , 'hex'
  ).toString('hex');
}

async function main() {
  console.log('Deploying CashCowsMarket ...')
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const milk = { address: network.contracts.milk }
  const dolla = { address: network.contracts.dolla }
  const market = await deploy('CashCowsMarket', milk.address, dolla.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsMarket deployed to:', market.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    market.address, 
    `"${milk.address}"`, 
    `"${dolla.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCowsMilk contract, grant MINTER_ROLE, BURNER_ROLE to market contract')
  console.log(` - ${network.scanner}/address/${milk.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${market.address} )`)
  console.log(` - grantRole( ${getRole('BURNER_ROLE')}, ${market.address} )`)
  console.log('In CashCowsDolla contract, grant MINTER_ROLE, BURNER_ROLE to market contract')
  console.log(` - ${network.scanner}/address/${dolla.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${market.address} )`)
  console.log(` - grantRole( ${getRole('BURNER_ROLE')}, ${market.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});