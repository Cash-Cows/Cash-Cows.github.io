const { expect, deploy, bindContract, getRole } = require('../utils');

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

  it('Should set conversion', async function () {
    const { admin } = this.signers
    
    await admin.withCulling.setTokenConversion(1000)
    
    expect(
      await admin.withCulling.tokenConversion()
    ).to.equal(1000)
  })

  it('Should burn', async function () {
    const { admin, holder } = this.signers

    expect(
      await admin.withCulling.balanceOf(holder.address)
    ).to.equal(0)

    await holder.withCulling.burn(1)

    expect(
      await admin.withCulling.redeemable(holder.address)
    ).to.equal(ethers.utils.parseEther('1000'))

    await expect(
      admin.withNFT.ownerOf(24)
    ).to.be.revertedWith('NonExistentToken()')

    expect(
      await admin.withNFT.burned(1)
    ).to.equal(holder.address)

    expect(
      await admin.withCulling.balanceOf(holder.address)
    ).to.equal(1)
  })

  it('Should redeem', async function () {
    const { admin, holder } = this.signers

    await holder.withCulling.redeem()

    expect(
      await admin.withToken.balanceOf(holder.address)
    ).to.equal(ethers.utils.parseEther('1000'))
  })

  it('Should burn and redeem', async function () {
    const { admin, holder } = this.signers

    await holder.withCulling.burnRedeem(2)

    expect(
      await admin.withToken.balanceOf(holder.address)
    ).to.be.above(ethers.utils.parseEther('2111'))

    await expect(
      admin.withNFT.ownerOf(2)
    ).to.be.revertedWith('NonExistentToken()')

    expect(
      await admin.withNFT.burned(2)
    ).to.equal(holder.address)

    expect(
      await admin.withCulling.balanceOf(holder.address)
    ).to.equal(2)
  })
})