const { expect } = require('chai');
require('dotenv').config()

if (process.env.BLOCKCHAIN_NETWORK != 'hardhat') {
  console.error('Exited testing with network:', process.env.BLOCKCHAIN_NETWORK)
  process.exit(1);
}

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

async function bindContract(key, name, contract, signers) {
  //attach contracts
  for (let i = 0; i < signers.length; i++) {
    const Contract = await ethers.getContractFactory(name, signers[i]);
    signers[i][key] = await Contract.attach(contract.address);
  }

  return signers;
}

function getRole(name) {
  if (!name || name === 'DEFAULT_ADMIN_ROLE') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  return '0x' + Buffer.from(ethers.utils.solidityKeccak256(['string'], [name]).slice(2), 'hex').toString('hex');
}

describe('CashCowsCulling Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.base = 'https://ipfs.io/ipfs/Qm123abc/'
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    
    const token = await deploy('CashCowsMilk', signers[0].address)
    await bindContract('withToken', 'CashCowsMilk', token, signers)
    
    const royalty = await deploy('CashCowsTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsTreasury', royalty, signers)
    
    const culling = await deploy('CashCowsCulling')
    await bindContract('withCulling', 'CashCowsCulling', culling, signers)
    
    const [ admin, funder, holder ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //make culling MINTER_ROLE, APPROVED_ROLE
    await admin.withNFT.grantRole(getRole('APPROVED_ROLE'), culling.address)
    await admin.withToken.grantRole(getRole('MINTER_ROLE'), culling.address)
    //mint a few to holder
    await admin.withNFT['mint(address,uint256)'](holder.address, 10)
    //send money to treasury
    await funder.sendTransaction({
      to: royalty.address,
      value: ethers.utils.parseEther('10')
    })
    //set nft, royalty, token to culling
    await admin.withCulling.setToken(token.address)
    await admin.withCulling.setCollection(nft.address)
    await admin.withCulling.setTreasury(royalty.address)
    
    this.signers = { admin, holder }
  })

  it('Should burn', async function () {
    const { admin, holder} = this.signers

    expect(
      await admin.withCulling.balanceOf(holder.address)
    ).to.equal(0)

    await admin.withCulling.setTokenConversion(1000)
    await holder.withCulling.burn(1)

    expect(
      await admin.withCulling.redeemable(holder.address)
    ).to.equal(ethers.utils.parseEther('1000'))

    await holder.withCulling.redeem()

    await expect(
      admin.withNFT.ownerOf(24)
    ).to.be.revertedWith('NonExistentToken()')

    expect(
      await admin.withNFT.burned(1)
    ).to.equal(holder.address)

    expect(
      await admin.withCulling.balanceOf(holder.address)
    ).to.equal(1)

    expect(
      await admin.withToken.balanceOf(holder.address)
    ).to.equal(ethers.utils.parseEther('1000'))
  })
})