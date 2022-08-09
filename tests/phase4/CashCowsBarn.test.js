const { expect, deploy, bindContract, getRole } = require('../utils');

function authorize(
  nft,   tokenId, 
  name,  crew,
  eyes,  head,
  mask,  neck,
  outerwear
) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      [
        'string',   'address',
        'uint256',  'string',
        'string',   'string',
        'string',   'string',
        'string',   'string'
      ],
      [
        'registry', nft.address, 
        tokenId,    name,
        crew,       eyes,
        head,       mask,
        neck,       outerwear
      ]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsBarn Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft1 = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT1', 'CashCows', nft1, signers)
    const nft2 = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT2', 'CashCowsClub', nft2, signers)
    const registry = await deploy('CashCowsRegistry', signers[0].address)
    await bindContract('withRegistry', 'CashCowsRegistry', registry, signers)
    const barn = await deploy('CashCowsBarn')
    await bindContract('withBarn', 'CashCowsBarn', barn, signers)
    const token = await deploy('CashCowsMilk', signers[0].address)
    await bindContract('withToken', 'CashCowsMilk', token, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT1.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT1.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withRegistry.grantRole(getRole('AUTHORIZE_ROLE'), admin.address)

    //grant mint role to barn
    await admin.withToken.grantRole(getRole('MINTER_ROLE'), barn.address)

    //mint to owners
    await admin.withNFT1['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT2.setMaxMint(40)
    await admin.withNFT2.setMintPrice(ethers.utils.parseEther('0.01'))
    await admin.withNFT2.openMint(true)
    await holder2.withNFT2['mint(uint256)'](10, { value: ethers.utils.parseEther('0.40') })

    //register some tokens
    const method1 = 'register(address,uint256,string,string,string,string,string,string,string,bytes)'
    await admin.withRegistry[method1](admin.withNFT1.address, 1, 
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 
      await admin.signMessage(
        authorize(admin.withNFT1, 1, 'a', 'b', 'c', 'd', 'e', 'f', 'g')
      )
    )
    await admin.withRegistry[method1](admin.withNFT2.address, 1, 
      'h', 'i', 'j', 'k', 'l', 'm', 'n', 
      await admin.signMessage(
        authorize(admin.withNFT2, 1, 'h', 'i', 'j', 'k', 'l', 'm', 'n')
      )
    )

    //add registry to barn
    await admin.withBarn.setRegistry(admin.withRegistry.address)
    //add token to barn
    await admin.withBarn.setToken(admin.withToken.address)
    //set rate
    await admin.withBarn.setRate(admin.withNFT1.address, 'b', 1)
    await admin.withBarn.setRate(admin.withNFT2.address, 'i', 2)

    this.releaseable1 = await admin.withBarn.releaseable(admin.withNFT1.address, 1)
    this.releaseable2 = await admin.withBarn.releaseable(admin.withNFT2.address, 1)

    this.signers = { admin, holder1, holder2 }
  })

  it('Should be releaseable', async function () {
    const { admin } = this.signers

    await admin.withBarn.setRate(admin.withNFT1.address, 'b', 1)
    await admin.withBarn.setRate(admin.withNFT2.address, 'i', 2)

    expect(
      await admin.withBarn.releaseable(admin.withNFT1.address, 1)
    ).to.be.above(this.releaseable1)

    expect(
      await admin.withBarn.releaseable(admin.withNFT2.address, 1)
    ).to.be.above(this.releaseable2)

    expect(
      await admin.withBarn.releaseable(admin.withNFT2.address, 1)
    ).to.be.above(
      await admin.withBarn.releaseable(admin.withNFT1.address, 1)
    )
  })


  it('Should release', async function () {
    const { admin, holder1, holder2 } = this.signers

    await holder1.withBarn.release(admin.withNFT1.address, [1])
    expect(await admin.withToken.balanceOf(holder1.address)).to.equal(21)

    await holder2.withBarn.release(admin.withNFT2.address, [1])
    expect(await admin.withToken.balanceOf(holder2.address)).to.equal(44)
  })

  it('Should not release', async function () {
    const { admin, holder1, holder2 } = this.signers

    await expect(
      holder2.withBarn.release(admin.withNFT1.address, [1])
    ).to.be.revertedWith('InvalidCall()')

    await expect(
      holder1.withBarn.release(admin.withNFT2.address, [1])
    ).to.be.revertedWith('InvalidCall()')
  })
})