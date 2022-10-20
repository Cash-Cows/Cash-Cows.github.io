//to run this on testnet:
//$ npx hardhat run scripts/phase4/6-deploy-store.js

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
  //get network and admin
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const dolla = { address: network.contracts.dolla }
  const loot = { address: network.contracts.loot }
  const admin = new ethers.Wallet(network.accounts[0])

  console.log('Deploying CashCowsStore ...')
  const store = await deploy('CashCowsStore', loot.address, admin.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsStore deployed to:', store.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    store.address,
    `"${loot.address}"`,
    `"${admin.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Roles:')
  console.log(` - FUNDER_ROLE - ${getRole('FUNDER_ROLE')}`)
  console.log(` - CURATOR_ROLE - ${getRole('CURATOR_ROLE')}`)
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCowsDolla contract, grant BURNER_ROLE to loot contract')
  console.log(` - ${network.scanner}/address/${dolla.address}#writeContract`)
  console.log(` - grantRole( ${getRole('BURNER_ROLE')}, ${loot.address} )`)
  console.log('In CashCowsStore contract, grant CURATOR_ROLE, FUNDER_ROLE to admin (choose another wallet)')
  console.log(` - ${network.scanner}/address/${store.address}#writeContract`)
  console.log(` - grantRole( ${getRole('FUNDER_ROLE')}, ${admin.address} )`)
  console.log(` - grantRole( ${getRole('CURATOR_ROLE')}, ${admin.address} )`)
  console.log('In CashCowsStore contract, make dolla burnable')
  console.log(` - ${network.scanner}/address/${store.address}#writeContract`)
  console.log(` - burnable( ${dolla.address}, true )`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});