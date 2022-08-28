const { expect, deploy, bindContract, getRole } = require('../utils');

function authorize(recipient) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address'],
      ['mint', recipient]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsClub Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.base = 'https://ipfs.io/ipfs/Qm123abc/'
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCowsClub', nft, signers)
    const metadata = await deploy('CashCowsClubMetadata')
    await bindContract('withMetadata', 'CashCowsClubMetadata', metadata, signers)
    const royalty = await deploy('CashCowsClubTreasury', nft.address)
    await bindContract('withTreasury', 'CashCowsClubTreasury', royalty, signers)
    
    const [
      admin,
      tokenOwner0, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)

    //setup metadata
    await admin.withMetadata.setBaseURI(this.base)
    
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
      tokenOwner0.withNFT['mint(uint256)'](3, { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//sale not started
      tokenOwner0.withNFT['mint(uint256)'](8, { value: ethers.utils.parseEther('0.015') })
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

    //for allowlist mint, set maxMint, mintPrice, proof
    await admin.withNFT.setMaxMint(9)
    await admin.withNFT.setMintPrice(ethers.utils.parseEther('0.04'))
  
    await tokenOwner0.withNFT['mint(uint256,bytes)'](5, await admin.signMessage(
      authorize(tokenOwner0.address)
    ), { value: ethers.utils.parseEther('0.2') })

    expect(await admin.withNFT.ownerOf(1)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(2)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(3)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(4)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(5)).to.equal(tokenOwner0.address)

    await tokenOwner0.withNFT['mint(uint256,bytes)'](4, await admin.signMessage(
      authorize(tokenOwner0.address)
    ), { value: ethers.utils.parseEther('0.16') })

    expect(await admin.withNFT.ownerOf(6)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(7)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(8)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(9)).to.equal(tokenOwner0.address)

    await tokenOwner1.withNFT['mint(uint256,bytes)'](9, await admin.signMessage(
      authorize(tokenOwner1.address)
    ), { value: ethers.utils.parseEther('0.36') })

    expect(await admin.withNFT.ownerOf(10)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(11)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(12)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(13)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(14)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(15)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(16)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(17)).to.equal(tokenOwner1.address)
    expect(await admin.withNFT.ownerOf(18)).to.equal(tokenOwner1.address)
  })

  it('Should not whitelist mint', async function () {
    const { admin, tokenOwner0, tokenOwner1, tokenOwner2 } = this.signers
    await expect(//quantity > max mint
      tokenOwner0.withNFT['mint(uint256,bytes)'](5, await admin.signMessage(
        authorize(tokenOwner0.address)
      ), { value: ethers.utils.parseEther('0.36') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong amount
      tokenOwner2.withNFT['mint(uint256,bytes)'](2, await admin.signMessage(
        authorize(tokenOwner0.address)
      ), { value: ethers.utils.parseEther('0.04') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//using another persons proof
      tokenOwner0.withNFT['mint(uint256,bytes)'](2, await admin.signMessage(
        authorize(tokenOwner1.address)
      ), { value: ethers.utils.parseEther('0.08') })
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
    //paid mint
    await tokenOwner2.withNFT['mint(uint256)'](1, { value: ethers.utils.parseEther('0.04') })
    //multiple paid mint
    await tokenOwner2.withNFT['mint(uint256)'](2, { value: ethers.utils.parseEther('0.08') })
    expect(await admin.withNFT.ownerOf(19)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(20)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(21)).to.equal(tokenOwner2.address)
    
    const tokens = await admin.withNFT.ownerTokens(tokenOwner2.address)
    expect(tokens[0]).to.equal(19)
    expect(tokens[1]).to.equal(20)
    expect(tokens[2]).to.equal(21)

    await tokenOwner3.withNFT['mint(uint256)'](2, { value: ethers.utils.parseEther('0.08') })
    expect(await admin.withNFT.ownerOf(22)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(23)).to.equal(tokenOwner3.address)
  })

  it('Should not mint', async function () {
    const { tokenOwner2, tokenOwner4 } = this.signers
    await expect(//cant mint anymore
      tokenOwner2.withNFT['mint(uint256)'](7, { value: ethers.utils.parseEther('0.28') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//invalid amount
      tokenOwner4.withNFT['mint(uint256)'](6, { value: ethers.utils.parseEther('0.04') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//invalid amount
      tokenOwner4.withNFT['mint(uint256)'](0, { value: ethers.utils.parseEther('1') })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should withdraw', async function () {
    const { admin } = this.signers

    await admin.withNFT.updateTreasury(admin.withTreasury.address)

    const adminBalance = parseFloat(
      ethers.utils.formatEther(await admin.getBalance())
    )

    const treasuryBalance = parseFloat(
      ethers.utils.formatEther(await ethers.provider.getBalance(admin.withTreasury.address))
    )

    await expect(//no base uri set
      admin.withNFT.withdraw(admin.address)
    ).to.be.revertedWith('InvalidCall()')

    await admin.withNFT.updateMetadata(admin.withMetadata.address)
    await admin.withNFT.withdraw(admin.address)
    
    expect(parseFloat(
      ethers.utils.formatEther(await admin.getBalance())
      //also less gas
    ) - adminBalance).to.be.above(0.45)
    
    expect(parseFloat(
      ethers.utils.formatEther(await ethers.provider.getBalance(admin.withTreasury.address))
      //also less gas
    ) - treasuryBalance).to.be.above(0.45)
    
    expect(parseFloat(
      ethers.utils.formatEther(await ethers.provider.getBalance(admin.withNFT.address))
      //also less gas
    )).to.equal(0)
  })

  it('Should get the correct token URIs', async function () {
    const { admin } = this.signers

    for (let i = 1; i <= 23; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}.json`)
    }
  })

  it('Should calc royalties', async function () {
    const { admin } = this.signers

    await admin.withNFT.updateTreasury(admin.withTreasury.address)
    const info = await admin.withNFT.royaltyInfo(1, 1000)
    expect(info.receiver).to.equal(admin.withTreasury.address)
    expect(info.royaltyAmount).to.equal(100)
  })

  it('Only Treasury can burn', async function () {
    const { admin, tokenOwner2} = this.signers
    await expect(
      tokenOwner2.withNFT.burn(22)
    ).to.be.revertedWith('InvalidCall()')
  })
})