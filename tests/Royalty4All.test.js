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

function ethFloor(number, precision = 18) {
  const decimals = Math.pow(10, precision)
  return Math.floor(number * decimals) / decimals
}

describe('Royalty4All ETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)

    const royalty = await deploy('Royalty4All', nft.address)
    await bindContract('withTreasury', 'Royalty4All', royalty, signers)
    
    const [
      admin,
      funder1,
      funder2,
      holder1, 
      holder2, 
      holder3
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 1)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder3.address, 20)
    //send ETH to Treasury
    await funder1.sendTransaction({
      to: funder1.withTreasury.address,
      value: ethers.utils.parseEther('10')
    })
    await funder2.sendTransaction({
      to: funder2.withTreasury.address,
      value: ethers.utils.parseEther('10')
    })

    this.signers = { 
      holder1, 
      holder2, 
      holder3
    }
  })
  
  it('Should be releaseable', async function () {
    const { holder1, holder2, holder3 } = this.signers

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseable(uint256)'](1)
      )
    ).to.equal(String(ethFloor(20/7777)))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseableBatch(uint256[])'](
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        )
      )
    ).to.equal(String(ethFloor(10 * 20/7777, 17)))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['totalReleased()']()
      )
    ).to.equal(String('0.0'))

    expect(await holder1.withTreasury.shares(holder1.address)).to.equal(1)
    expect(await holder1.withTreasury.shares(holder2.address)).to.equal(10)
    expect(await holder1.withTreasury.shares(holder3.address)).to.equal(20)
    expect(await holder1.withTreasury.payee(1)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(2)).to.equal(holder2.address)

    holder3.withNFT.transferFrom(holder3.address, holder1.address, 12)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 13)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 14)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 15)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 16)
    
    expect(await holder1.withTreasury.shares(holder1.address)).to.equal(6)
    expect(await holder1.withTreasury.shares(holder3.address)).to.equal(15)
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
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    )
    expect(
      ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(uint256[])'](
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
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

describe('Royalty4All WETH Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)

    const royalty = await deploy('Royalty4All', nft.address)
    await bindContract('withTreasury', 'Royalty4All', royalty, signers)
  
    const weth = await deploy('MockERC20WETH')
    await bindContract('withWETH', 'MockERC20WETH', weth, signers)
    
    const [
      admin,
      holder1, 
      holder2, 
      holder3
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    //mint to owners
    await admin.withNFT['mint(address,uint256)'](holder1.address, 1)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder3.address, 20)
    
    //send WETH to Treasury
    await admin.withWETH.mint(
      admin.withTreasury.address, 
      ethers.utils.parseEther('20')
    )

    this.weth = admin.withWETH.address
    
    this.signers = { 
      holder1, 
      holder2, 
      holder3
    }
  })
  
  it('Should be releaseable', async function () {
    const { holder1, holder2, holder3 } = this.signers

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseable(address,uint256)'](this.weth, 1)
      )
    ).to.equal(String(ethFloor(20/7777)))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['releaseableBatch(address,uint256[])'](
          this.weth, 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        )
      )
    ).to.equal(String(ethFloor(10 * 20/7777, 17)))

    expect(
      ethers.utils.formatEther(
        await holder1.withTreasury['totalReleased(address)'](this.weth)
      )
    ).to.equal(String('0.0'))

    expect(await holder1.withTreasury.shares(holder1.address)).to.equal(1)
    expect(await holder1.withTreasury.shares(holder2.address)).to.equal(10)
    expect(await holder1.withTreasury.shares(holder3.address)).to.equal(20)
    expect(await holder1.withTreasury.payee(1)).to.equal(holder1.address)
    expect(await holder1.withTreasury.payee(2)).to.equal(holder2.address)

    holder3.withNFT.transferFrom(holder3.address, holder1.address, 12)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 13)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 14)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 15)
    holder3.withNFT.transferFrom(holder3.address, holder1.address, 16)
    
    expect(await holder1.withTreasury.shares(holder1.address)).to.equal(6)
    expect(await holder1.withTreasury.shares(holder3.address)).to.equal(15)
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
    )).to.equal(String(ethFloor(20/7777)))

    //batch release test
    await holder2.withTreasury['releaseBatch(address,uint256[])'](
      this.weth, 
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    )
    expect(
      ethers.utils.formatEther(
        await holder2.withTreasury['releaseableBatch(address,uint256[])'](
          this.weth, 
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        )
      )
    ).to.equal(String('0.0'))

    expect(ethers.utils.formatEther(
      await holder2.withWETH.balanceOf(holder2.address)
    )).to.equal(String(ethFloor(20 * 10/7777, 17)))

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
    )).to.equal(String(ethFloor(20 * 3/7777, 17)+'3'))
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