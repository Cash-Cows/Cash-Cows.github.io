//to run this on testnet:
//$ npx hardhat run scripts/phase4/2-deploy-dolla.js

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
  const admin = new ethers.Wallet(network.accounts[0])

  console.log('Deploying CashCowsDolla ...')
  const token = await deploy('CashCowsDolla', admin.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsDolla deployed to:', token.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    '--contract contracts/phase4/CashCowsDolla.sol:CashCowsDolla',
    token.address,
    `"${admin.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Roles:')
  console.log(` - MINTER_ROLE - ${getRole('MINTER_ROLE')}`)
  console.log(` - PAUSER_ROLE - ${getRole('PAUSER_ROLE')}`)
  console.log(` - BURNER_ROLE - ${getRole('BURNER_ROLE')}`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});