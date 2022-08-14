const { expect, deploy, bindContract, getRole } = require('../utils')

function release(collection, tokenId, rate) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      [ 'string', 'address', 'uint256', 'uint256' ],
      [ 'release', collection, tokenId, rate ]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsBarn Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'
    this.start = Math.floor(Date.now() / 1000)

    const nft1 = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT1', 'CashCows', nft1, signers)
    const nft2 = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT2', 'CashCowsClub', nft2, signers)
    const token = await deploy('CashCowsMilk', signers[0].address)
    await bindContract('withToken', 'CashCowsMilk', token, signers)
    const barn = await deploy('CashCowsBarn', token.address, this.start, signers[0].address)
    await bindContract('withBarn', 'CashCowsBarn', barn, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT1.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT1.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withBarn.grantRole(getRole('MINTER_ROLE'), admin.address)

    //grant mint role to barn
    await admin.withToken.grantRole(getRole('MINTER_ROLE'), barn.address)

    //mint to owners
    await admin.withNFT1['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT2.setMaxMint(40)
    await admin.withNFT2.setMintPrice(ethers.utils.parseEther('0.01'))
    await admin.withNFT2.openMint(true)
    await holder2.withNFT2['mint(uint256)'](10, { value: ethers.utils.parseEther('0.40') })

    //set some rates
    this.proofs = [
      await admin.signMessage(release(nft1.address, 1, 1)),
      await admin.signMessage(release(nft1.address, 2, 2)),
      await admin.signMessage(release(nft2.address, 1, 1)),
      await admin.signMessage(release(nft2.address, 2, 2))
    ]

    this.releaseables = [
      await admin.withBarn.releaseable(admin.withNFT1.address, 1, 1),
      await admin.withBarn.releaseable(admin.withNFT1.address, 2, 2),
      await admin.withBarn.releaseable(admin.withNFT2.address, 1, 1),
      await admin.withBarn.releaseable(admin.withNFT2.address, 2, 2)
    ]

    this.signers = { admin, holder1, holder2 }
  })

  it('Should be releaseable', async function () {
    const { admin } = this.signers

    //write something random (this is done so the timestamp can tick again)
    await admin.withNFT2.openMint(true)

    expect(
      await admin.withBarn.releaseable(admin.withNFT1.address, 1, 1)
    ).to.be.above(this.releaseables[0])
    expect(
      await admin.withBarn.releaseable(admin.withNFT1.address, 2, 2)
    ).to.be.above(this.releaseables[1])
    
    expect(
      await admin.withBarn.releaseable(admin.withNFT2.address, 1, 1)
    ).to.be.above(this.releaseables[2])
    expect(
      await admin.withBarn.releaseable(admin.withNFT2.address, 2, 2)
    ).to.be.above(this.releaseables[3])

    expect(
      await admin.withBarn.releaseable(admin.withNFT2.address, 2, 2)
    ).to.be.above(
      await admin.withBarn.releaseable(admin.withNFT1.address, 1, 1)
    )
  })

  it('Should release', async function () {
    const { admin, holder1, holder2 } = this.signers

    //single release
    await holder1.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT1.address, 1, 1, this.proofs[0])
    expect(await admin.withToken.balanceOf(holder1.address)).to.be.above(13)

    await holder2.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT2.address, 2, 2, this.proofs[3])
    expect(await admin.withToken.balanceOf(holder2.address)).to.be.above(26)

    //multi release
    await holder1.withBarn['release(address,uint256[],uint256[],bytes[])'](
      admin.withNFT1.address, 
      [1, 2], 
      [1, 2], 
      [this.proofs[0], this.proofs[1]]
    )
    expect(await admin.withToken.balanceOf(holder1.address)).to.be.above(47)

    await holder2.withBarn['release(address,uint256[],uint256[],bytes[])'](
      admin.withNFT2.address, 
      [1, 2], 
      [1, 2], 
      [this.proofs[2], this.proofs[3]]
    )
    expect(await admin.withToken.balanceOf(holder2.address)).to.above(47)
  })

  it('Should not release', async function () {
    const { admin, holder1, holder2 } = this.signers

    //write something random (this is done so the timestamp can tick again)
    await admin.withNFT2.openMint(true)

    await expect(//not owner
      holder2.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT1.address, 1, 1, this.proofs[0])
    ).to.be.revertedWith('InvalidCall()')
    await expect(//not owner
      holder1.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT2.address, 1, 2, this.proofs[2])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//not owner
      holder2.withBarn['release(address,uint256[],uint256[],bytes[])'](
        admin.withNFT1.address, 
        [1, 2], 
        [1, 2], 
        [this.proofs[0], this.proofs[1]]
      )
    ).to.be.revertedWith('InvalidCall()')

    await expect(//not owner
      holder1.withBarn['release(address,uint256[],uint256[],bytes[])'](
        admin.withNFT2.address, 
        [1, 2], 
        [1, 2], 
        [this.proofs[2], this.proofs[3]]
      )
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong proof
      holder2.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT1.address, 1, 1, this.proofs[1])
    ).to.be.revertedWith('InvalidCall()')
    await expect(//wrong proof
      holder2.withBarn['release(address,uint256,uint256,bytes)'](admin.withNFT2.address, 1, 1, this.proofs[1])
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong proof
      holder2.withBarn['release(address,uint256[],uint256[],bytes[])'](
        admin.withNFT1.address, 
        [1, 2], 
        [1, 2], 
        [this.proofs[0], this.proofs[3]]
      )
    ).to.be.revertedWith('InvalidCall()')
    await expect(//wrong proof
      holder1.withBarn['release(address,uint256[],uint256[],bytes[])'](
        admin.withNFT2.address, 
        [1, 2], 
        [1, 3], 
        [this.proofs[2], this.proofs[3]]
      )
    ).to.be.revertedWith('InvalidCall()')
  })
})