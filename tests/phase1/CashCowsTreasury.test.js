const { expect, deploy, bindContract, getRole } = require('../utils');

function ethFloor(number, precision = 18) {
  const decimals = Math.pow(10, precision)
  return Math.floor(number * decimals) / decimals
}

describe('CashCowsTreasury ETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const treasury = await deploy('CashCowsTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsTreasury', treasury, signers)
    
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
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 20)
    await admin.withNFT['mint(address,uint256)'](holder3.address, 30)
    await admin.withNFT['mint(address,uint256)'](holder4.address, 40)
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
      parseFloat(ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(uint256[])'](
          [ 20, 21, 22, 23, 24, 25, 26, 27, 28, 29 ]
        )
      ))//20 eth * 10 tokens / 100
    ).to.equal(ethFloor(20 * 10/this.supply, 17))

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
    const { holder1, holder2 } = this.signers

    //single release test
    const startingBalance1 = parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
    )
    await holder1.withTreasury['release(uint256)'](1)
    expect(await holder1.withTreasury['releaseable(uint256)'](1)).to.equal(0)

    expect(parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
      //also less gas
    ) - startingBalance1).to.be.above(0.0019)

    //batch release test
    const startingBalance2 = parseFloat(
      ethers.utils.formatEther(await holder2.getBalance())
    )
    await holder2.withTreasury['releaseBatch(uint256[])'](
      [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
    )
    expect(
      ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(uint256[])'](
          [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
        )
      )
    ).to.equal(String('0.0'))

    expect(parseFloat(
      ethers.utils.formatEther(await holder2.getBalance())
      //also less gas
    ) - startingBalance2).to.be.above(0.019)

    //batch release test mixed with released token
    const startingBalance3 = parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
    )
    await holder1.withTreasury['releaseBatch(uint256[])'](
      [1, 12, 13, 13, 13]
    )
    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseableBatch(uint256[])'](
          [1, 12, 13]
        )
      )
    ).to.equal(String('0.0'))

    expect(parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
      //also less gas
    ) - startingBalance3).to.be.above(0.0038)
  })
  
  it('Should not release', async function () {
    const { holder1, holder2, holder3 } = this.signers

    await expect(//no payment due
      holder1.withTreasury['release(uint256)'](1)
    ).to.be.revertedWith('InvalidCall()')

    await expect(//no payment due
      holder1.withTreasury['releaseBatch(uint256[])']([1, 12, 13])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//does not own tokens
      holder3.withTreasury['releaseBatch(uint256[])']([1, 12, 13])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//does not own tokens (partial)
      holder3.withTreasury['releaseBatch(uint256[])']([17, 18, 1])
    ).to.be.revertedWith('InvalidCall()')
    
    await expect(//tokens do not exist
      holder1.withTreasury['release(uint256)'](1000000)
    ).to.be.revertedWith('NonExistentToken()')

    await expect(//tokens do not exist
      holder1.withTreasury['releaseBatch(uint256[])']([2000000, 3000000, 4000000])
    ).to.be.revertedWith('NonExistentToken()')
  })
})

describe('CashCowsTreasury WETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)

    const royalty = await deploy('CashCowsTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsTreasury', royalty, signers)
  
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
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 20)
    await admin.withNFT['mint(address,uint256)'](holder3.address, 30)
    await admin.withNFT['mint(address,uint256)'](holder4.address, 40)
    
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
      parseFloat(ethers.utils.formatEther(
        await holder1.withTreasury['releaseableBatch(address,uint256[])'](
          this.weth, 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        )
      ))
    ).to.equal(ethFloor(10 * 20/this.supply, 17))

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

    //batch release test
    await holder2.withTreasury['releaseBatch(address,uint256[])'](
      this.weth, 
      [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
    )
    expect(
      ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(address,uint256[])'](
          this.weth, 
          [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
        )
      )
    ).to.equal(String('0.0'))

    expect(parseFloat(ethers.utils.formatEther(
      await holder2.withWETH.balanceOf(holder2.address)
    ))).to.equal(ethFloor(20 * 10/this.supply, 17))

    //batch release test mixed with released token
    await holder1.withTreasury['releaseBatch(address,uint256[])'](
      this.weth, 
      [1, 12, 13, 13, 13]
    )
    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseableBatch(address,uint256[])'](
          this.weth, 
          [1, 12, 13]
        )
      )
    ).to.equal(String('0.0'))

    expect(ethers.utils.formatEther(
      await holder1.withWETH.balanceOf(holder1.address)
    )).to.equal(String(ethFloor(20 * 3/this.supply, 17)))
  })
  
  it('Should not release', async function () {
    const { holder1, holder2, holder3 } = this.signers

    await expect(//no payment due
      holder1.withTreasury['release(address,uint256)'](this.weth, 1)
    ).to.be.revertedWith('InvalidCall()')

    await expect(//no payment due
      holder1.withTreasury['releaseBatch(address,uint256[])'](this.weth, [1, 12, 13])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//does not own tokens
      holder3.withTreasury['releaseBatch(address,uint256[])'](this.weth, [1, 12, 13])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//does not own tokens (partial)
      holder3.withTreasury['releaseBatch(address,uint256[])'](this.weth, [17, 18, 1])
    ).to.be.revertedWith('InvalidCall()')
    
    await expect(//tokens do not exist
      holder1.withTreasury['release(address,uint256)'](this.weth, 1000000)
    ).to.be.revertedWith('NonExistentToken()')

    await expect(//tokens do not exist
      holder1.withTreasury['releaseBatch(address,uint256[])'](this.weth, [2000000, 3000000, 4000000])
    ).to.be.revertedWith('NonExistentToken()')
  })
})

describe('CashCowsTreasury Burn Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const treasury = await deploy('CashCowsTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsTreasury', treasury, signers)
    
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
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 20)
    await admin.withNFT['mint(address,uint256)'](holder3.address, 30)
    await admin.withNFT['mint(address,uint256)'](holder4.address, 40)
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
      admin,
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
      parseFloat(ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(uint256[])'](
          [ 20, 21, 22, 23, 24, 25, 26, 27, 28, 29 ]
        )
      ))//20 eth * 10 tokens / 100
    ).to.equal(ethFloor(20 * 10/this.supply, 17))

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
  })

  it('Should burn 10 (90 supply)', async function () {
    const { holder4 } = this.signers

    //burn in random order
    await holder4.withNFT.burn(70)
    await holder4.withNFT.burn(61)
    await holder4.withNFT.burn(66)
    await holder4.withNFT.burn(62)
    await holder4.withNFT.burn(67)
    await holder4.withNFT.burn(63)
    await holder4.withNFT.burn(64)
    await holder4.withNFT.burn(69)
    await holder4.withNFT.burn(65)
    await holder4.withNFT.burn(68)

    expect(
      await holder4.withNFT.ownerOf(71)
    ).to.equal(holder4.address)

    //update supply
    this.supply = await holder4.withNFT.totalSupply()
  })

  it('Should release with new calculations', async function () {
    const { holder1, holder4 } = this.signers

    expect(
      String(ethFloor(ethers.utils.formatEther(
        await holder4.withTreasury['releaseable(uint256)'](1)
      )))//20 eth / 90
    ).to.equal(String(ethFloor(20/this.supply)))

    //single release test
    const startingBalance1 = parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
    )
    await holder1.withTreasury['release(uint256)'](1)
    expect(await holder1.withTreasury['releaseable(uint256)'](1)).to.equal(0)
    expect(parseFloat(
      ethers.utils.formatEther(await holder1.getBalance())
      //also less gas
    ) - startingBalance1).to.be.above(0.22)
  })

  it('Should burn 10 more (80 supply)', async function () {
    const { holder4 } = this.signers

    //burn in random order
    await holder4.withNFT.burn(80)
    await holder4.withNFT.burn(71)
    await holder4.withNFT.burn(76)
    await holder4.withNFT.burn(72)
    await holder4.withNFT.burn(77)
    await holder4.withNFT.burn(73)
    await holder4.withNFT.burn(74)
    await holder4.withNFT.burn(79)
    await holder4.withNFT.burn(75)
    await holder4.withNFT.burn(78)

    expect(
      await holder4.withNFT.ownerOf(81)
    ).to.equal(holder4.address)

    //update supply
    this.supply = await holder4.withNFT.totalSupply()
  })

  it('Should release with new calculations', async function () {
    const { holder1, holder4 } = this.signers

    //fresh redeem
    expect(
      String(ethFloor(ethers.utils.formatEther(
        await holder4.withTreasury['releaseable(uint256)'](2)
      )))//20 eth / 80 = 0.25
    ).to.equal(String(ethFloor(20/this.supply)))

    const released = ethers.utils.formatEther(
      await holder4.withTreasury['released(uint256)'](1)
    )

    //redeemed already
    expect(
      String(ethFloor(ethers.utils.formatEther(
        await holder4.withTreasury['releaseable(uint256)'](1)
      ), 16))//20 eth / 80
    ).to.equal(String(ethFloor(20/this.supply - released, 16)))
  })
})