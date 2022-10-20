const { expect, deploy, bindContract, getRole } = require('../utils')

describe('CashCowsLoot Tests', function() {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const dolla = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withDolla', 'CashCowsDolla', dolla, signers)
    const loot = await deploy('CashCowsLoot', this.preview, signers[0].address)
    await bindContract('withLoot', 'CashCowsLoot', loot, signers)
    const weth = await deploy('MockERC20WETH')
    await bindContract('withWETH', 'MockERC20WETH', weth, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('FUNDER_ROLE'), admin.address)

    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    
    this.signers = { admin, holder1, holder2 }
    this.zero = '0x0000000000000000000000000000000000000000'
  })

  it('Should set max supply', async function () {
    const { admin } = this.signers
    await admin.withLoot['setMaxSupply(uint256[],uint256[])']([ 1 ], [ 3 ])
    expect(await admin.withLoot.maxSupply(1)).to.equal(3)
  })

  it('Should mint', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,uint256,uint256,bytes)'

    //recipient, itemid, amount, data
    await admin.withLoot[mint](holder1.address, 1, 1, [])
    await admin.withLoot[mint](holder2.address, 1, 2, [])

    expect(await admin.withLoot.balanceOf(holder1.address, 1)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 1)).to.equal(2)
    expect(await admin.withLoot.totalSupply(1)).to.equal(3)

    await admin.withLoot[mint](holder1.address, 2, 1, [])
    await admin.withLoot[mint](holder2.address, 2, 10, [])
    
    expect(await admin.withLoot.balanceOf(holder1.address, 2)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 2)).to.equal(10)
    expect(await admin.withLoot.totalSupply(2)).to.equal(11)
  })

  it('Should not mint', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,uint256,uint256,bytes)'
    await expect(//no more supply
      admin.withLoot[mint](admin.address, 1, 20, [])
    ).to.be.revertedWith('InvalidCall()')
  })
})