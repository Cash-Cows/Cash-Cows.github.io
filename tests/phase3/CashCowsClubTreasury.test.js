const { expect, deploy, bindContract, getRole } = require('../utils');

function ethFloor(number, precision = 18) {
  const decimals = Math.pow(10, precision)
  return Math.floor(number * decimals) / decimals
}

describe('CashCowsClubTreasury ETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCowsClub', nft, signers)
    const treasury = await deploy('CashCowsClubTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsClubTreasury', treasury, signers)
    
    const [
      admin,
      funder1,
      funder2,
      holder1, 
      holder2, 
      holder3, 
      holder4
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //set treasury
    await admin.withNFT.updateTreasury(treasury.address)
    //mint to owners
    await admin.withNFT.setMaxMint(40)
    await admin.withNFT.setMintPrice(ethers.utils.parseEther('0.01'))
    await admin.withNFT.openMint(true)
    await holder1.withNFT['mint(uint256)'](10, { value: ethers.utils.parseEther('0.40') })
    await holder2.withNFT['mint(uint256)'](20, { value: ethers.utils.parseEther('0.80') })
    await holder3.withNFT['mint(uint256)'](30, { value: ethers.utils.parseEther('1.20') })
    await holder4.withNFT['mint(uint256)'](40, { value: ethers.utils.parseEther('1.60') })
    //send ETH to Treasury
    await funder1.sendTransaction({
      to: funder1.withTreasury.address,
      value: ethers.utils.parseEther('10')
    })
    await funder2.sendTransaction({
      to: funder2.withTreasury.address,
      value: ethers.utils.parseEther('10')
    })

    this.supply = await admin.withNFT.totalSupply()

    this.signers = { 
      holder1, 
      holder2, 
      holder3, 
      holder4
    }
  })
  
  it('Should be releaseable', async function () {
    const { holder1, holder2, holder3, holder4 } = this.signers
    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseable(uint256)'](1)
      )//20 eth / 100
    ).to.equal(String(ethFloor(20/this.supply)))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['totalReleased()']()
      )
    ).to.equal(String('0.0'))

    expect(await holder1.withTreasury['shares(address)'](holder1.address)).to.equal(10)
    expect(await holder1.withTreasury['shares(address)'](holder2.address)).to.equal(20)
    expect(await holder1.withTreasury['shares(address)'](holder3.address)).to.equal(30)
    expect(await holder1.withTreasury['shares(address)'](holder4.address)).to.equal(40)
    expect(await holder1.withTreasury.payee(1)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(11)).to.equal(holder2.address)
    expect(await holder1.withTreasury.payee(31)).to.equal(holder3.address)
    expect(await holder1.withTreasury.payee(61)).to.equal(holder4.address)

    holder2.withNFT.transferFrom(holder2.address, holder1.address, 12)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 13)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 14)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 15)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 16)
    
    expect(await holder1.withTreasury['shares(address)'](holder1.address)).to.equal(15)
    expect(await holder1.withTreasury['shares(address)'](holder2.address)).to.equal(15)
    expect(await holder1.withTreasury.payee(12)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(13)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(14)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(15)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(16)).to.equal(holder1.address)
  })
  
  it('Should release', async function () {
    const { holder1 } = this.signers

    const releaseable = await holder1.withTreasury['releaseable(uint256)'](1)

    //single release test
    const startingBalance1 = parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
    )
    await holder1.withTreasury['release(uint256)'](1)

    expect(parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
      //also less gas
    ) - startingBalance1).to.be.above(0.0019)

    await expect(
      holder1.withNFT.ownerOf(1)
    ).to.be.revertedWith('NonExistentToken()')

    expect(
      await holder1.withTreasury['releaseable(uint256)'](2)
    ).to.be.above(releaseable)
  })
  
  it('Should not release', async function () {
    const { holder1 } = this.signers

    await expect(//not exists anymore
      holder1.withTreasury['release(uint256)'](1)
    ).to.be.revertedWith('NonExistentToken()')
  })
})

describe('CashCowsClubTreasury WETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCowsClub', nft, signers)

    const royalty = await deploy('CashCowsClubTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsClubTreasury', royalty, signers)
  
    const weth = await deploy('MockERC20WETH')
    await bindContract('withWETH', 'MockERC20WETH', weth, signers)
    
    const [
      admin,
      holder1, 
      holder2, 
      holder3, 
      holder4
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //set treasury
    await admin.withNFT.updateTreasury(royalty.address)
    //mint to owners
    await admin.withNFT.setMaxMint(40)
    await admin.withNFT.setMintPrice(ethers.utils.parseEther('0.01'))
    await admin.withNFT.openMint(true)
    await holder1.withNFT['mint(uint256)'](10, { value: ethers.utils.parseEther('0.40') })
    await holder2.withNFT['mint(uint256)'](20, { value: ethers.utils.parseEther('0.80') })
    await holder3.withNFT['mint(uint256)'](30, { value: ethers.utils.parseEther('1.20') })
    await holder4.withNFT['mint(uint256)'](40, { value: ethers.utils.parseEther('1.60') })
    
    //send WETH to Treasury
    await admin.withWETH.mint(
      admin.withTreasury.address, 
      ethers.utils.parseEther('20')
    )

    this.weth = admin.withWETH.address
    this.supply = await admin.withNFT.totalSupply()
    
    this.signers = { 
      holder1, 
      holder2, 
      holder3, 
      holder4
    }
  })
  
  it('Should be releaseable', async function () {
    const { holder1, holder2, holder3, holder4 } = this.signers
    expect(
      parseFloat(ethers.utils.formatEther(
        await holder1.withTreasury['releaseable(address,uint256)'](this.weth, 1)
      ))
    ).to.equal(ethFloor(20/this.supply))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['totalReleased(address)'](this.weth)
      )
    ).to.equal(String('0.0'))

    expect(await holder1.withTreasury['shares(address)'](holder1.address)).to.equal(10)
    expect(await holder1.withTreasury['shares(address)'](holder2.address)).to.equal(20)
    expect(await holder1.withTreasury['shares(address)'](holder3.address)).to.equal(30)
    expect(await holder1.withTreasury['shares(address)'](holder4.address)).to.equal(40)
    expect(await holder1.withTreasury.payee(1)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(11)).to.equal(holder2.address)
    expect(await holder1.withTreasury.payee(31)).to.equal(holder3.address)
    expect(await holder1.withTreasury.payee(61)).to.equal(holder4.address)

    holder2.withNFT.transferFrom(holder2.address, holder1.address, 12)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 13)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 14)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 15)
    holder2.withNFT.transferFrom(holder2.address, holder1.address, 16)
    
    expect(await holder1.withTreasury['shares(address)'](holder1.address)).to.equal(15)
    expect(await holder1.withTreasury['shares(address)'](holder2.address)).to.equal(15)
    expect(await holder1.withTreasury.payee(12)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(13)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(14)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(15)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(16)).to.equal(holder1.address)
  })
  
  it('Should release', async function () {
    const { holder1, holder2 } = this.signers

    //single release test
    await holder1.withTreasury['release(address,uint256)'](this.weth, 1)
    expect(await holder1.withTreasury['releaseable(address,uint256)'](this.weth, 1)).to.equal(0)
    
    expect(ethers.utils.formatEther(
      await holder1.withWETH.balanceOf(holder1.address)
    )).to.equal(String(ethFloor(20/this.supply)))
    //withdrawing weth != burn :)
    expect(await holder1.withNFT.ownerOf(1)).to.equal(holder1.address)
  })
  
  it('Should not release', async function () {
    const { holder2 } = this.signers

    await expect(//wrong owner
      holder2.withTreasury['release(address,uint256)'](this.weth, 2)
    ).to.be.revertedWith('InvalidCall()')
  })
})