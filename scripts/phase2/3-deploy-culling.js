//to run this on testnet:
//$ npx hardhat run scripts/phase2/3-deploy-culling.js

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
  console.log('Deploying CashCowsCulling ...')
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const nft = { address: network.contracts.nft }
  const token = { address: network.contracts.token }
  const treasury = { address: network.contracts.treasury }
  const culling = await deploy('CashCowsCulling')

  console.log('')
  console.log('-----------------------------------')
  console.log('CashCowsCulling deployed to:', culling.address)
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    culling.address
  )
  console.log('')
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In CashCows contract, grant APPROVED_ROLE to culling contract')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - grantRole( ${getRole('APPROVED_ROLE')}, ${culling.address} )`)
  console.log('In CashCowsMilk contract, grant MINTER_ROLE to culling contract')
  console.log(` - ${network.scanner}/address/${token.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${culling.address} )`)
  console.log('In CashCowsCulling contract, add nft, tokem treasury')
  console.log(` - ${network.scanner}/address/${culling.address}#writeContract`)
  console.log(` - setCollection( ${nft.address} )`)
  console.log(` - setToken( ${token.address} )`)
  console.log(` - setTreasury( ${treasury.address} )`)
  console.log(` - setTokenConversion( 10000 )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});