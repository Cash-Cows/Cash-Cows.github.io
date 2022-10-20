const { expect, deploy, bindContract, getRole } = require('../utils')

describe('CashCowsStore Tests', function() {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const dolla = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withDolla', 'CashCowsDolla', dolla, signers)
    const loot = await deploy('CashCowsLoot', this.preview, signers[0].address)
    await bindContract('withLoot', 'CashCowsLoot', loot, signers)
    const store = await deploy('CashCowsStore', loot.address, signers[0].address)
    await bindContract('withStore', 'CashCowsStore', store, signers)
    const weth = await deploy('MockERC20WETH')
    await bindContract('withWETH', 'MockERC20WETH', weth, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to nft MINTER_ROLE to mint to nfts to holder 
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)

    //grant admin to dolla MINTER_ROLE to mint to dolla to holders
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withDolla.mint(holder1.address, 100)
    await admin.withDolla.mint(holder2.address, 200)
    await admin.withDolla.mint(admin.address, 400)

    //mint weth for holder
    await admin.withWETH.mint(holder1.address, 100)
    await admin.withWETH.mint(holder2.address, 200)
    await admin.withWETH.mint(admin.address, 1000)
    
    //grant store CURATOR_ROLE to admin to mark dolla as burnable
    await admin.withStore.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withStore.burnTokens(admin.withDolla.address, true)
  
    //grant loot CURATOR_ROLE to admin (for testing)
    await admin.withLoot.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //grant loot MINTER_ROLE to store (for testing)
    await admin.withLoot.grantRole(getRole('MINTER_ROLE'), store.address)
    //grant loot FUNDER_ROLE to admin (for testing)
    await admin.withStore.grantRole(getRole('FUNDER_ROLE'), admin.address)
    //allow store to burn dolla (for testing)
    await admin.withDolla.grantRole(getRole('BURNER_ROLE'), store.address)
    
    this.signers = { admin, holder1, holder2 }
    this.zero = '0x0000000000000000000000000000000000000000'

    this.methods = {
      setPrice: [
        'setPrice(uint256,address[],uint256[])',
        'setPrice(uint256[],address[][],uint256[][])'
      ],
      setMaxSupply: [
        'setMaxSupply(uint256,uint256)',
        'setMaxSupply(uint256[],uint256[])'
      ]
    }
  })

  it('Should add item', async function () {
    const { admin } = this.signers
    const dolla = admin.withDolla.address

    const { setPrice, setMaxSupply } = this.methods

    await admin.withLoot[setMaxSupply[0]](1, 3)
    expect(await admin.withLoot.maxSupply(1)).to.equal(3)
    expect(await admin.withLoot.totalSupply(1)).to.equal(0)
    await admin.withStore[setPrice[0]](1, [ this.zero, dolla ], [ 10, 10 ])
    expect(await admin.withStore['priceOf(uint256)'](1)).to.equal(10)
    expect(await admin.withStore['priceOf(uint256,address)'](1, dolla)).to.equal(10)

    await admin.withLoot[setMaxSupply[1]](
      [2, 3, 4, 5], 
      [3, 0, 3, 0]
    )
    await admin.withStore[setPrice[1]](
      [2, 3, 4, 5], 
      [
        [ this.zero, dolla ],
        [ this.zero, dolla ],
        [],
        [ this.zero, dolla ]
      ], 
      [
        [ 20, 20 ],
        [ 30, 30 ],
        [],
        [ 50, 50 ]
      ]
    )

    expect(await admin.withLoot.maxSupply(2)).to.equal(3)
    expect(await admin.withLoot.maxSupply(3)).to.equal(0)
    expect(await admin.withLoot.maxSupply(4)).to.equal(3)
    expect(await admin.withLoot.maxSupply(5)).to.equal(0)

    expect(await admin.withLoot.totalSupply(2)).to.equal(0)
    expect(await admin.withLoot.totalSupply(3)).to.equal(0)
    expect(await admin.withLoot.totalSupply(4)).to.equal(0)
    expect(await admin.withLoot.totalSupply(5)).to.equal(0)
    
    expect(await admin.withStore['priceOf(uint256)'](2)).to.equal(20)
    expect(await admin.withStore['priceOf(uint256)'](3)).to.equal(30)
    expect(await admin.withStore['priceOf(uint256)'](4)).to.equal(0)
    expect(await admin.withStore['priceOf(uint256,address)'](5, this.zero)).to.equal(50)

    expect(await admin.withStore['priceOf(uint256,address)'](2, dolla)).to.equal(20)
    expect(await admin.withStore['priceOf(uint256,address)'](3, dolla)).to.equal(30)
    expect(await admin.withStore['priceOf(uint256,address)'](4, dolla)).to.equal(0)
    expect(await admin.withStore['priceOf(uint256,address)'](5, dolla)).to.equal(50)

    const info = await admin.withStore.infoOf(1, [this.zero, dolla])
    expect(info.supply).to.equal(0)
    expect(info.max).to.equal(3)
    expect(info.prices[0]).to.equal(10)
    expect(info.prices[1]).to.equal(10)
  })

  it('Should mint (eth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'

    //token, recipient, itemid, amount
    await holder1.withStore[mint](this.zero, holder1.address, 1, 1, { value: 10 })
    await holder2.withStore[mint](this.zero, holder2.address, 1, 2, { value: 20 })

    expect(await admin.withLoot.balanceOf(holder1.address, 1)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 1)).to.equal(2)
    expect(await admin.withLoot.totalSupply(1)).to.equal(3)

    expect(await ethers.provider.getBalance(admin.withStore.address)).to.equal(30)

    const info = await admin.withStore.infoOf(1, [this.zero])
    expect(info.supply).to.equal(3)
    expect(info.max).to.equal(3)
    expect(info.prices[0]).to.equal(10)
  })

  it('Should not mint (eth)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    await expect(//no more supply
      admin.withStore[mint](this.zero, admin.address, 1, 20, { value: 200 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not enough supply
      admin.withStore[mint](this.zero, admin.address, 2, 20, { value: 400 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withStore[mint](this.zero, admin.address, 2, 1, { value: 10 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withStore[mint](this.zero, admin.address, 4, 1, { value: 1000 })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (eth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'

    await holder1.withStore[mint](this.zero, holder1.address, [3, 5], [1, 1], { value: 80 })
    await holder2.withStore[mint](this.zero, holder2.address, [3, 5], [2, 2], { value: 160 })

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(2)

    expect(await admin.withLoot.totalSupply(3)).to.equal(3)
    expect(await admin.withLoot.totalSupply(5)).to.equal(3)

    expect(await ethers.provider.getBalance(admin.withStore.address)).to.equal(270)
  })

  it('Should not mint batch (eth)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    await expect(//no more supply
      admin.withStore[mint](this.zero, admin.address, [1], [20], { value: 200 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not enough supply
      admin.withStore[mint](this.zero, admin.address, [2], [20], { value: 400 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withStore[mint](this.zero, admin.address, [2], [1], { value: 10 })
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withStore[mint](this.zero, admin.address, [4], [1], { value: 1000 })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint (dolla)', async function () {
    const { admin, holder1, holder2 } = this.signers

    const mint = 'mint(address,address,uint256,uint256)'
    const dolla = admin.withDolla.address
    await holder1.withStore[mint](dolla, holder1.address, 2, 1)
    await holder2.withStore[mint](dolla, holder2.address, 2, 2)

    expect(await admin.withLoot.balanceOf(holder1.address, 2)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 2)).to.equal(2)
    expect(await admin.withLoot.totalSupply(2)).to.equal(3)

    expect(await admin.withDolla.balanceOf(holder1.withStore.address)).to.equal(0)
  })

  it('Should not mint (dolla)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    const dolla = admin.withDolla.address
    await expect(//no more supply
      admin.withStore[mint](dolla, admin.address, 2, 20)
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not enough funds
      admin.withStore[mint](dolla, admin.address, 3, 1000)
    ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    await expect(//no price
      admin.withStore[mint](dolla, admin.address, 4, 1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (dolla)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const dolla = admin.withDolla.address
    await holder1.withStore[mint](dolla, holder1.address, [3, 5], [1, 1])
    await holder2.withStore[mint](dolla, holder2.address, [3, 5], [2, 2])

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(4)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(2)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(4)

    expect(await admin.withLoot.totalSupply(3)).to.equal(6)
    expect(await admin.withLoot.totalSupply(5)).to.equal(6)

    expect(await admin.withDolla.balanceOf(holder1.withStore.address)).to.equal(0)
  })

  it('Should not mint batch (dolla)', async function () {
    const { admin } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const dolla = admin.withDolla.address
    await expect(//no more supply
      admin.withStore[mint](dolla, admin.address, [2], [20])
    ).to.be.revertedWith('InvalidCall()')
    await expect(//incorrect amount
      admin.withStore[mint](dolla, admin.address, [3], [100])
    ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    await expect(//no price
      admin.withStore[mint](dolla, admin.address, [4], [1])
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint (weth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256,uint256)'
    const weth = admin.withWETH.address

    const { setPrice, setMaxSupply } = this.methods

    await admin.withLoot[setMaxSupply[0]](6, 3)
    await admin.withStore[setPrice[0]](6, [ weth ], [ 50 ])

    await holder1.withWETH.approve(admin.withStore.address, 100)
    await holder2.withWETH.approve(admin.withStore.address, 200)

    await holder1.withStore[mint](weth, holder1.address, 6, 1)
    await holder2.withStore[mint](weth, holder2.address, 6, 2)

    expect(await admin.withLoot.balanceOf(holder1.address, 6)).to.equal(1)
    expect(await admin.withLoot.balanceOf(holder2.address, 6)).to.equal(2)
    expect(await admin.withLoot.totalSupply(6)).to.equal(3)

    expect(await admin.withWETH.balanceOf(holder1.address)).to.equal(50)
    expect(await admin.withWETH.balanceOf(holder2.address)).to.equal(100)
    expect(await admin.withWETH.balanceOf(holder1.withStore.address)).to.equal(150)
  })

  it('Should not mint (weth)', async function () {
    const { admin } = this.signers
    const weth = admin.withWETH.address
    const mint = 'mint(address,address,uint256,uint256)'
    await admin.withWETH.approve(admin.withStore.address, 1000)
    await expect(//no more supply
      admin.withStore[mint](weth, admin.address, 6, 20)
    ).to.be.revertedWith('InvalidCall()')
    await expect(//no price
      admin.withStore[mint](weth, admin.address, 4, 1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should mint batch (weth)', async function () {
    const { admin, holder1, holder2 } = this.signers
    const mint = 'mint(address,address,uint256[],uint256[])'
    const weth = admin.withWETH.address
    const { setPrice } = this.methods
    
    await admin.withStore[setPrice[1]](
      [3, 5], 
      [ [ weth ], [ weth ] ], 
      [ [ 10 ], [ 10 ] ]
    )

    await holder1.withStore[mint](weth, holder1.address, [3, 5], [1, 1])
    await holder2.withStore[mint](weth, holder2.address, [3, 5], [2, 2])

    expect(await admin.withLoot.balanceOf(holder1.address, 3)).to.equal(3)
    expect(await admin.withLoot.balanceOf(holder2.address, 3)).to.equal(6)
    expect(await admin.withLoot.balanceOf(holder1.address, 5)).to.equal(3)
    expect(await admin.withLoot.balanceOf(holder2.address, 5)).to.equal(6)

    expect(await admin.withLoot.totalSupply(3)).to.equal(9)
    expect(await admin.withLoot.totalSupply(5)).to.equal(9)

    expect(await admin.withWETH.balanceOf(holder1.address)).to.equal(30)
    expect(await admin.withWETH.balanceOf(holder2.address)).to.equal(60)
    expect(await admin.withWETH.balanceOf(holder1.withStore.address)).to.equal(210)
  })

  it('Should withdraw', async function () {
    const { admin, holder1 } = this.signers

    expect(await ethers.provider.getBalance(admin.withStore.address)).to.equal(270)
    const ethBalance = await holder1.getBalance()
    await admin.withStore['withdraw(address)'](holder1.address)
    expect((await holder1.getBalance()).sub(ethBalance).toString()).to.be.equal('270')

    expect(await admin.withWETH.balanceOf(admin.withStore.address)).to.equal(210)
    await admin.withStore['withdraw(address,address,uint256)'](admin.withWETH.address, holder1.address, 210)
    expect(await admin.withWETH.balanceOf(holder1.address)).to.be.equal(240)
  })
})