//to run this on testnet:
//$ npx hardhat run scripts/phase4/4-deploy-loot.js

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

const uri = 'https://www.wearecashcows.com/data/ethereum/loot/'

async function main() {
  //get network and admin
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const admin = new ethers.Wallet(network.accounts[0])

  console.log('Deploying CashCowsLoot ...')
  const loot = await deploy('CashCowsLoot', uri, admin.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsLoot deployed to:', loot.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    loot.address,
    `"${uri}"`,
    `"${admin.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Roles:')
  console.log(` - BURNER_ROLE - ${getRole('BURNER_ROLE')}`)
  console.log(` - MINTER_ROLE - ${getRole('MINTER_ROLE')}`)
  console.log(` - PAUSER_ROLE - ${getRole('PAUSER_ROLE')}`)
  console.log(` - CURATOR_ROLE - ${getRole('CURATOR_ROLE')}`)
  console.log(` - APPROVED_ROLE - ${getRole('APPROVED_ROLE')}`)
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCowsLoot contract, grant CURATOR_ROLE to admin (choose another wallet)')
  console.log(` - ${network.scanner}/address/${loot.address}#writeContract`)
  console.log(` - grantRole( ${getRole('CURATOR_ROLE')}, ${admin.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});