//to run this on testnet:
//$ npx hardhat run scripts/phase4/1-deploy-barn.js

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
  console.log('Deploying CashCowsBarn ...')
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const admin = new ethers.Wallet(network.accounts[0])
  const milk = { address: network.contracts.milk }
  const barn = await deploy('CashCowsBarn', milk.address, 1661616000, admin.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsBarn deployed to:', barn.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    barn.address, 
    `"${milk.address}"`,
    1661616000, 
    `"${admin.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCowsMilk contract, grant MINTER_ROLE to barn contract')
  console.log(` - ${network.scanner}/address/${milk.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${barn.address} )`)
  console.log('')
  console.log('In CashCowsBarn contract, grant MINTER_ROLE to admin')
  console.log(` - ${network.scanner}/address/${barn.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${admin.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});