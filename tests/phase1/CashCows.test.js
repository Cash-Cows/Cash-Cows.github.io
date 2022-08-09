const { expect, deploy, bindContract, getRole } = require('../utils');

function authorize(recipient, maxMint, maxFree) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['mint', recipient, maxMint, maxFree]
    ).slice(2),
    'hex'
  )
}

describe('CashCows Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.base = 'https://ipfs.io/ipfs/Qm123abc/'
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const metadata = await deploy('CashCowsMetadata')
    await bindContract('withMetadata', 'CashCowsMetadata', metadata, signers)
    const royalty = await deploy('CashCowsTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsTreasury', royalty, signers)
    const index = await deploy('CashCowsIndex')
    await bindContract('withIndex', 'CashCowsIndex', index, signers)

    //fix minting overrides
    //['mint(uint256)']
    //['mint(address,uint256)']
    //['mint(uint256,uint256,uint256,bytes)']
    for (let i = 0; i < signers.length; i++) {
      signers[i].withNFT.mint = function(...args) {
        switch (args.length) {
          case 1: return signers[i].withNFT['mint(uint256)'](...args)
          case 4: return signers[i].withNFT['mint(uint256,uint256,uint256,bytes)'](...args)
          case 5: return signers[i].withNFT['mint(uint256,uint256,uint256,bytes)'](...args)
        }
  
        if (args.length === 2) {
          if (typeof args[0] === 'number') {
            return signers[i].withNFT['mint(uint256)'](...args)
          }
          return signers[i].withNFT['mint(address,uint256)'](...args)
        }
      }
    }
    
    const [
      admin,
      tokenOwner0, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)

    //setup metadata
    await admin.withMetadata.setBaseURI(this.base)
    await admin.withMetadata.setTreasury(royalty.address)
    await admin.withMetadata.setStage(0, ethers.utils.parseEther('0.03'))
    await admin.withMetadata.setStage(1, ethers.utils.parseEther('0.06'))
    await admin.withMetadata.setStage(2, ethers.utils.parseEther('0.09'))
    
    this.signers = { 
      admin,
      tokenOwner0, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4
    }
  })
  
  it('Should not mint', async function () {
    const { tokenOwner0 } = this.signers
    await expect(//sale not started
      tokenOwner0.withNFT.mint(3, { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//sale not started
      tokenOwner0.withNFT.mint(8, { value: ethers.utils.parseEther('0.015') })
    ).to.be.revertedWith('InvalidCall()')
  })
  
  it('Should error when getting token URI', async function () {
    const { admin } = this.signers
    await expect(//token does not exist
      admin.withNFT.tokenURI(1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should whitelist mint', async function () {
    const { admin, tokenOwner0, tokenOwner1 } = this.signers
  
    //                             quantity, maxMint, maxFree, proof
    await tokenOwner0.withNFT.mint(5, 15, 5, await admin.signMessage(
      //        recipient, maxMint, maxFree
      authorize(tokenOwner0.address, 15, 5)
    ), { value: 0 })

    expect(await admin.withNFT.ownerOf(1)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(2)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(3)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(4)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(5)).to.equal(tokenOwner0.address)

    //                             quantity, maxMint, maxFree, proof
    await tokenOwner1.withNFT.mint(5, 15, 4, await admin.signMessage(
      //        recipient, maxMint, maxFree
      authorize(tokenOwner1.address, 15, 4)
    ), { value: ethers.utils.parseEther('0.005') })

    expect(await admin.withNFT.ownerOf(6)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(7)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(8)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(9)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(10)).to.equal(tokenOwner1.address)

    //allowlist
    //                             quantity, maxMint, maxFree, proof
    await tokenOwner1.withNFT.mint(1, 15, 0, await admin.signMessage(
      //        recipient, maxMint, maxFree
      authorize(tokenOwner1.address, 15, 0)
    ), { value: ethers.utils.parseEther('0.005') })
    expect(await admin.withNFT.ownerOf(11)).to.equal(tokenOwner1.address)

    //                             quantity, maxMint, maxFree, proof
    await tokenOwner1.withNFT.mint(9, 15, 5, await admin.signMessage(
      //        recipient, maxMint, maxFree
      authorize(tokenOwner1.address, 15, 5)
    ), { value: ethers.utils.parseEther('0.045') })

    expect(await admin.withNFT.ownerOf(12)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(13)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(14)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(15)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(16)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(17)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(18)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(19)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(20)).to.equal(tokenOwner1.address)
  })

  it('Should not whitelist mint', async function () {
    const { admin, tokenOwner0, tokenOwner1 } = this.signers
    await expect(//quantity > max mint
      //                       quantity, maxMint, maxFree, proof
      tokenOwner0.withNFT.mint(5, 4, 5, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner0.address, 4, 5)
      ), { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//free cannot be more than max
      //                       quantity, maxMint, maxFree, proof
      tokenOwner0.withNFT.mint(5, 4, 6, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner0.address, 4, 6)
      ), { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//quantity > max mint
      //                       quantity, maxMint, maxFree, proof
      tokenOwner0.withNFT.mint(5, 4, 3, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner0.address, 4, 3)
      ), { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong amount
      //                       quantity, maxMint, maxFree, proof
      tokenOwner0.withNFT.mint(2, 2, 1, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner0.address, 2, 1)
      ), { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//using another persons proof
      //                       quantity, maxMint, maxFree, proof
      tokenOwner0.withNFT.mint(2, 2, 1, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner1.address, 2, 1)
      ), { value: ethers.utils.parseEther('0.005') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//max mint
      //                       quantity, maxMint, maxFree, proof
      tokenOwner1.withNFT.mint(2, 2, 1, await admin.signMessage(
        //        recipient, maxMint, maxFree
        authorize(tokenOwner1.address, 2, 1)
      ), { value: ethers.utils.parseEther('0.005') })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should open mint', async function () {  
    const { admin } = this.signers
    expect(await admin.withNFT.mintOpened()).to.equal(false)
    await admin.withNFT.openMint(false)
    expect(await admin.withNFT.mintOpened()).to.equal(false)
    await admin.withNFT.openMint(true)
    expect(await admin.withNFT.mintOpened()).to.equal(true)
  })

  it('Should mint', async function () {
    const { admin, tokenOwner2, tokenOwner3 } = this.signers
    //mint free
    await tokenOwner2.withNFT.mint(1, { value: 0 })
    //paid mint
    await tokenOwner2.withNFT.mint(1, { value: ethers.utils.parseEther('0.005') })
    //multiple paid mint
    await tokenOwner2.withNFT.mint(2, { value: ethers.utils.parseEther('0.01') })
    expect(await admin.withNFT.ownerOf(21)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(22)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(23)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(24)).to.equal(tokenOwner2.address)
    
    const tokens = await admin.withIndex.ownerTokens(
      tokenOwner2.withNFT.address, 
      tokenOwner2.address,
      24
    )
    expect(tokens[0]).to.equal(21)
    expect(tokens[1]).to.equal(22)
    expect(tokens[2]).to.equal(23)
    expect(tokens[3]).to.equal(24)

    //one free, one paid
    await tokenOwner3.withNFT.mint(2, { value: ethers.utils.parseEther('0.005') })
    expect(await admin.withNFT.ownerOf(25)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(26)).to.equal(tokenOwner3.address)

    //admin mint
    await admin.withNFT.mint(tokenOwner3.address, 4)
    expect(await admin.withNFT.ownerOf(27)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(28)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(29)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(30)).to.equal(tokenOwner3.address)
  })

  it('Should not mint', async function () {
    const { tokenOwner2, tokenOwner4 } = this.signers
    await expect(//cant mint anymore
      tokenOwner2.withNFT.mint(7, { value: ethers.utils.parseEther('0.035') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//invalid amount
      tokenOwner4.withNFT.mint(6, { value: ethers.utils.parseEther('0.004') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//invalid amount
      tokenOwner4.withNFT.mint(0, { value: ethers.utils.parseEther('0.004') })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should withdraw', async function () {
    const { admin } = this.signers

    const startingBalance = parseFloat(
      ethers.utils.formatEther(await admin.getBalance())
    )

    await expect(//no base uri set
      admin.withNFT.withdraw(admin.address)
    ).to.be.revertedWith('InvalidCall()')

    await admin.withNFT.updateMetadata(admin.withMetadata.address)
    await admin.withNFT.withdraw(admin.address)
    
    expect(parseFloat(
      ethers.utils.formatEther(await admin.getBalance())
      //also less gas
    ) - startingBalance).to.be.above(0.069)
  })

  it('Should get the correct token URIs', async function () {
    const { admin } = this.signers

    for (let i = 1; i <= 30; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}_0.json`)
    }

    //load eth in treasury
    await admin.sendTransaction({
      to: admin.withTreasury.address,
      value: ethers.utils.parseEther('1')
    })
    for (let i = 1; i <= 30; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}_1.json`)
    }

    //load eth in treasury
    await admin.sendTransaction({
      to: admin.withTreasury.address,
      value: ethers.utils.parseEther('1')
    })
    for (let i = 1; i <= 30; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}_2.json`)
    }

    //load eth in treasury
    await admin.sendTransaction({
      to: admin.withTreasury.address,
      value: ethers.utils.parseEther('1')
    })
    for (let i = 1; i <= 30; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}_2.json`)
    }
  })

  it('Should calc royalties', async function () {
    const { admin } = this.signers

    await admin.withNFT.updateTreasury(admin.withTreasury.address)
    const info = await admin.withNFT.royaltyInfo(1, 1000)
    expect(info.receiver).to.equal(admin.withTreasury.address)
    expect(info.royaltyAmount).to.equal(100)
  })

  it('Should allow OS to transfer', async function () {
    const { admin, tokenOwner2, tokenOwner3} = this.signers

    await expect(
      admin.withNFT.transferFrom(tokenOwner3.address, tokenOwner2.address, 27)
    ).to.be.revertedWith('InvalidCall()')

    await admin.withNFT.grantRole(getRole('APPROVED_ROLE'), admin.address)
    await admin.withNFT.transferFrom(tokenOwner3.address, tokenOwner2.address, 27)
    expect(await admin.withNFT.ownerOf(27)).to.equal(tokenOwner2.address)
  })

  it('Should burn', async function () {
    const { admin, tokenOwner2} = this.signers
    await tokenOwner2.withNFT.burn(24)

    await expect(
      admin.withNFT.ownerOf(24)
    ).to.be.revertedWith('NonExistentToken()')

    const tokens = await admin.withIndex.ownerTokens(
      tokenOwner2.withNFT.address, 
      tokenOwner2.address,
      30
    )

    expect(tokens[0]).to.equal(21)
    expect(tokens[1]).to.equal(22)
    expect(tokens[2]).to.equal(23)
    expect(tokens[3]).to.equal(27)
    expect(tokens.length).to.equal(4)
  })
})