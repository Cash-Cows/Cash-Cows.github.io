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

    //allow loot to burn dolla
    await admin.withDolla.grantRole(getRole('BURNER_ROLE'), loot.address)
    
    //mint weth for holder
    await admin.withWETH.mint(holder1.address, 100)
    await admin.withWETH.mint(holder2.address, 200)
    //mint dolla for holder
    await admin.withLoot.burnTokens(admin.withDolla.address, true)
    await admin.withDolla.mint(holder1.address, 100)
    await admin.withDolla.mint(holder2.address, 200)
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    
    this.signers = { admin, holder1, holder2 }
    this.zero = '0x0000000000000000000000000000000000000000'
  })

  it('Should not mint', async function () {
    const { admin } = this.signers
    await expect(
      admin.withLoot['mint(address,uint256,uint256,bytes)'](admin.address, 1, 20, [])
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should add item', async function () {
    const { admin } = this.signers
    const dolla = admin.withDolla.address

    await admin.withLoot.addItem(1, [ this.zero, dolla ], [ 10, 10 ])
    await admin.withLoot.addItem(3, [ this.zero, dolla ], [ 20, 20 ])
    await admin.withLoot.addItem(0, [ this.zero, dolla ], [ 30, 30 ])
    await admin.withLoot.addItem(3, [], [])
    await admin.withLoot.addItem(0, [ this.zero, dolla ], [ 50, 50 ])

    expect(await admin.withLoot['priceOf(uint256)'](1)).to.equal(10)
    expect(await admin.withLoot['priceOf(uint256)'](2)).to.equal(20)
    expect(await admin.withLoot['priceOf(uint256)'](3)).to.equal(30)
    expect(await admin.withLoot['priceOf(uint256)'](4)).to.equal(0)
    expect(await admin.withLoot['priceOf(uint256,address)'](5, this.zero)).to.equal(50)

    expect(await admin.withLoot['priceOf(uint256,address)'](1, dolla)).to.equal(10)
    expect(await admin.withLoot['priceOf(uint256,address)'](2, dolla)).to.equal(20)
    expect(await admin.withLoot['priceOf(uint256,address)'](3, dolla)).to.equal(30)
    expect(await admin.withLoot['priceOf(uint256,address)'](4, dolla)).to.equal(0)
    expect(await admin.withLoot['priceOf(uint256,address)'](5, dolla)).to.equal(50)

    expect(await admin.withLoot.maxSupply(1)).to.equal(1)
    expect(await admin.withLoot.maxSupply(2)).to.equal(3)
    expect(await admin.withLoot.maxSupply(3)).to.equal(0)
    expect(await admin.withLoot.maxSupply(4)).to.equal(3)
    expect(await admin.withLoot.maxSupply(5)).to.equal(0)

    expect(await admin.withLoot.totalSupply(1)).to.equal(0)
    expect(await admin.withLoot.totalSupply(2)).to.equal(0)
    expect(await admin.withLoot.totalSupply(3)).to.equal(0)
    expect(await admin.withLoot.totalSupply(4)).to.equal(0)
    expect(await admin.withLoot.totalSupply(5)).to.equal(0)

    const info = await admin.withLoot.infoOf(1, [this.zero, dolla])
    expect(info.supply).to.equal(0)
    expect(info.max).to.equal(1)
    expect(info.prices[0]).to.equal(10)
    expect(info.prices[1]).to.equal(10)
  })

  it('Should update max supply', async function () {
    const { admin } = this.signers
    await admin.withLoot.updateMaxSupplies([ 1 ], [ 3 ])
    expect(await admin.withLoot.maxSupply(1)).to.equal(3)
  })

  it('Should set price', async function () {
    const { admin } = this.signers
    const dolla = admin.withDolla.address

    //item id, tokens, prices
    await admin.withLoot['updatePrices(uint256,address[],uint256[])'](3, [ this.zero, dolla ], [ 30, 30 ])
    //item ids, token, prices
    await admin.withLoot['updatePrices(uint256[],address,uint256[])']([ 5 ], this.zero, [ 50 ])
    await admin.withLoot['updatePrices(uint256[],address,uint256[])']([ 1, 2, 5 ], dolla, [ 10, 20, 50 ])

    expect(await admin.withLoot['priceOf(uint256)'](1)).to.equal(10)
    expect(await admin.withLoot['priceOf(uint256)'](2)).to.equal(20)
    expect(await admin.withLoot['priceOf(uint256)'](3)).to.equal(30)
    expect(await admin.withLoot['priceOf(uint256)'](4)).to.equal(0)
    expect(await admin.withLoot['priceOf(uint256)'](5)).to.equal(50)

    expect(await admin.withLoot['priceOf(uint256,address)'](1, dolla)).to.equal(10)
    expect(await admin.withLoot['priceOf(uint256,address)'](2, dolla)).to.equal(20)
    expect(await admin.withLoot['priceOf(uint256,address)'](3, dolla)).to.equal(30)
    expect(await admin.withLoot['priceOf(uint256,address)'](4, dolla)).to.equal(0)
    expect(await admin.withLoot['priceOf(uint256,address)'](5, dolla)).to.equal(50)
  })

  it('Should mint (eth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'

    //token, recipient, itemid, amount
    await holder1.withLoot[mint](this.zero, holder1.address, 1, 1, { value: 10 })
    await holder2.withLoot[mint](this.zero, holder2.address, 1, 2, { value: 20 })

    expect(await admin.withLoot.balanceOf(holder1.address, 1)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 1)).to.equal(2)
    expect(await admin.withLoot.totalSupply(1)).to.equal(3)

    expect(await ethers.provider.getBalance(admin.withLoot.address)).to.equal(30)

    const info = await admin.withLoot.infoOf(1, [this.zero])
    expect(info.supply).to.equal(3)
    expect(info.max).to.equal(3)
    expect(info.prices[0]).to.equal(10)
  })

  it('Should not mint (eth)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    await expect(//no more supply
      admin.withLoot[mint](this.zero, admin.address, 1, 20, { value: 200 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not enough supply
      admin.withLoot[mint](this.zero, admin.address, 2, 20, { value: 400 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withLoot[mint](this.zero, admin.address, 2, 1, { value: 10 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withLoot[mint](this.zero, admin.address, 4, 1, { value: 1000 })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (eth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'

    await holder1.withLoot[mint](this.zero, holder1.address, [3, 5], [1, 1], { value: 80 })
    await holder2.withLoot[mint](this.zero, holder2.address, [3, 5], [2, 2], { value: 160 })

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(2)

    expect(await admin.withLoot.totalSupply(3)).to.equal(3)
    expect(await admin.withLoot.totalSupply(5)).to.equal(3)

    expect(await ethers.provider.getBalance(admin.withLoot.address)).to.equal(270)
  })

  it('Should not mint batch (eth)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    await expect(//no more supply
      admin.withLoot[mint](this.zero, admin.address, [1], [20], { value: 200 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not enough supply
      admin.withLoot[mint](this.zero, admin.address, [2], [20], { value: 400 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withLoot[mint](this.zero, admin.address, [2], [1], { value: 10 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withLoot[mint](this.zero, admin.address, [4], [1], { value: 1000 })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint (dolla)', async function () {
    const { admin, holder1, holder2 } = this.signers

    const mint = 'mint(address,address,uint256,uint256)'
    const dolla = admin.withDolla.address
    await holder1.withLoot[mint](dolla, holder1.address, 2, 1)
    await holder2.withLoot[mint](dolla, holder2.address, 2, 2)

    expect(await admin.withLoot.balanceOf(holder1.address, 2)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 2)).to.equal(2)
    expect(await admin.withLoot.totalSupply(2)).to.equal(3)

    expect(await admin.withDolla.balanceOf(holder1.withLoot.address)).to.equal(0)
  })

  it('Should not mint (dolla)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    const dolla = admin.withDolla.address
    await expect(//no more supply
      admin.withLoot[mint](dolla, admin.address, 2, 20)
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withLoot[mint](dolla, admin.address, 3, 100)
    ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    await expect(//no price
      admin.withLoot[mint](dolla, admin.address, 4, 1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (dolla)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const dolla = admin.withDolla.address
    await holder1.withLoot[mint](dolla, holder1.address, [3, 5], [1, 1])
    await holder2.withLoot[mint](dolla, holder2.address, [3, 5], [2, 2])

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(4)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(4)

    expect(await admin.withLoot.totalSupply(3)).to.equal(6)
    expect(await admin.withLoot.totalSupply(5)).to.equal(6)

    expect(await admin.withDolla.balanceOf(holder1.withLoot.address)).to.equal(0)
  })

  it('Should not mint batch (dolla)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const dolla = admin.withDolla.address
    await expect(//no more supply
      admin.withLoot[mint](dolla, admin.address, [2], [20])
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withLoot[mint](dolla, admin.address, [3], [100])
    ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    await expect(//no price
      admin.withLoot[mint](dolla, admin.address, [4], [1])
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint (weth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    const weth = admin.withWETH.address
    await admin.withLoot.addItem(3, [ weth ], [ 50 ])

    await holder1.withWETH.approve(admin.withLoot.address, 100)
    await holder2.withWETH.approve(admin.withLoot.address, 200)

    await holder1.withLoot[mint](weth, holder1.address, 6, 1)
    await holder2.withLoot[mint](weth, holder2.address, 6, 2)

    expect(await admin.withLoot.balanceOf(holder1.address, 6)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 6)).to.equal(2)
    expect(await admin.withLoot.totalSupply(6)).to.equal(3)

    expect(await admin.withWETH.balanceOf(holder1.address)).to.equal(50)
    expect(await admin.withWETH.balanceOf(holder2.address)).to.equal(100)
    expect(await admin.withWETH.balanceOf(holder1.withLoot.address)).to.equal(150)
  })

  it('Should not mint (weth)', async function () {
    const { admin } = this.signers
    const weth = admin.withWETH.address
    const mint = 'mint(address,address,uint256,uint256)'
    await expect(//no more supply
      admin.withLoot[mint](weth, admin.address, 6, 20)
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withLoot[mint](weth, admin.address, 4, 1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (weth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const weth = admin.withWETH.address
    await admin.withLoot['updatePrices(uint256[],address,uint256[])']([ 3, 5 ], weth, [ 10, 10 ])

    await holder1.withLoot[mint](weth, holder1.address, [3, 5], [1, 1])
    await holder2.withLoot[mint](weth, holder2.address, [3, 5], [2, 2])

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(3)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(6)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(3)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(6)

    expect(await admin.withLoot.totalSupply(3)).to.equal(9)
    expect(await admin.withLoot.totalSupply(5)).to.equal(9)

    expect(await admin.withWETH.balanceOf(holder1.address)).to.equal(30)
    expect(await admin.withWETH.balanceOf(holder2.address)).to.equal(60)
    expect(await admin.withWETH.balanceOf(holder1.withLoot.address)).to.equal(210)
  })

  it('Should withdraw', async function () {
    const { admin, holder1 } = this.signers

    expect(await ethers.provider.getBalance(admin.withLoot.address)).to.equal(270)
    const ethBalance = await holder1.getBalance()
    await admin.withLoot['withdraw(address)'](holder1.address)
    expect((await holder1.getBalance()).sub(ethBalance).toString()).to.be.equal('270')

    expect(await admin.withWETH.balanceOf(admin.withLoot.address)).to.equal(210)
    await admin.withLoot['withdraw(address,address,uint256)'](admin.withWETH.address, holder1.address, 210)
    expect(await admin.withWETH.balanceOf(holder1.address)).to.be.equal(240)
  })
})