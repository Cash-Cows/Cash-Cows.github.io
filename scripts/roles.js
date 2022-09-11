//to run this on testnet:
// $ npx hardhat run scripts/roles.js

const hardhat = require('hardhat')

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
  console.log('ROLES:')
  console.log('DAO_ROLE', getRole('DAO_ROLE'))
  console.log('MINTER_ROLE', getRole('MINTER_ROLE'))
  console.log('BURNER_ROLE', getRole('BURNER_ROLE'))
  console.log('CURATOR_ROLE', getRole('CURATOR_ROLE'))
  console.log('APPROVED_ROLE', getRole('APPROVED_ROLE'))
  console.log('DEFAULT_ADMIN_ROLE', getRole('DEFAULT_ADMIN_ROLE'))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})
