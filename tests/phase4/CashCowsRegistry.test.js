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

describe('CashCowsRegistry Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft1 = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT1', 'CashCows', nft1, signers)
    const nft2 = await deploy('CashCowsClub', this.preview, signers[0].address)
    await bindContract('withNFT2', 'CashCowsClub', nft2, signers)
    const registry = await deploy('CashCowsRegistry', signers[0].address)
    await bindContract('withRegistry', 'CashCowsRegistry', registry, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT1.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT1.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT2.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withRegistry.grantRole(getRole('AUTHORIZE_ROLE'), admin.address)

    //mint to owners
    await admin.withNFT1['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT2.setMaxMint(40)
    await admin.withNFT2.setMintPrice(ethers.utils.parseEther('0.01'))
    await admin.withNFT2.openMint(true)
    await holder2.withNFT2['mint(uint256)'](10, { value: ethers.utils.parseEther('0.40') })

    this.signers = { admin, holder1, holder2 }
  })

  it('Should register', async function () {
    const { admin, holder1,  holder2 } = this.signers

    const method1 = 'register(address,uint256,string,string,string,string,string,string,string,bytes)'
    await holder1.withRegistry[method1](admin.withNFT1.address, 1, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 
      await admin.signMessage(
        authorize(admin.withNFT1, 1, 'a', 'b', 'c', 'd', 'e', 'f', 'g')
      )
    )
    await holder2.withRegistry[method1](admin.withNFT2.address, 1, 'h', 'i', 'j', 'k', 'l', 'm', 'n', 
      await admin.signMessage(
        authorize(admin.withNFT2, 1, 'h', 'i', 'j', 'k', 'l', 'm', 'n')
      )
    )
    //really anyone can register, even if your not holding
    await holder2.withRegistry[method1](admin.withNFT2.address, 2, 'o', 'p', 'q', 'r', 's', 't', 'u', 
      await admin.signMessage(
        authorize(admin.withNFT2, 2, 'o', 'p', 'q', 'r', 's', 't', 'u')
      )
    )
    //let the authorizer register too
    const method2 = 'register(address,uint256,string,string,string,string,string,string,string)'
    await admin.withRegistry[method2](admin.withNFT1.address, 2, 'o', 'p', 'q', 'r', 's', 't', 'u')
  })

  it('Should get metadata', async function () {
    const { admin } = this.signers
    const data1 = await admin.withRegistry.metadata(admin.withNFT1.address, 1)
    expect(data1.name).to.equal('a')
    expect(data1.crew).to.equal('b')
    expect(data1.eyes).to.equal('c')
    expect(data1.head).to.equal('d')
    expect(data1.mask).to.equal('e')
    expect(data1.neck).to.equal('f')
    expect(data1.outerwear).to.equal('g')
    expect(data1.active).to.equal(true)

    const data2 = await admin.withRegistry.metadata(admin.withNFT1.address, 2)
    expect(data2.name).to.equal('o')
    expect(data2.crew).to.equal('p')
    expect(data2.eyes).to.equal('q')
    expect(data2.head).to.equal('r')
    expect(data2.mask).to.equal('s')
    expect(data2.neck).to.equal('t')
    expect(data2.outerwear).to.equal('u')
    expect(data2.active).to.equal(true)

    const data3 = await admin.withRegistry.metadata(admin.withNFT2.address, 1)
    expect(data3.name).to.equal('h')
    expect(data3.crew).to.equal('i')
    expect(data3.eyes).to.equal('j')
    expect(data3.head).to.equal('k')
    expect(data3.mask).to.equal('l')
    expect(data3.neck).to.equal('m')
    expect(data3.outerwear).to.equal('n')
    expect(data3.active).to.equal(true)

    const data4 = await admin.withRegistry.metadata(admin.withNFT2.address, 2)
    expect(data4.name).to.equal('o')
    expect(data4.crew).to.equal('p')
    expect(data4.eyes).to.equal('q')
    expect(data4.head).to.equal('r')
    expect(data4.mask).to.equal('s')
    expect(data4.neck).to.equal('t')
    expect(data4.outerwear).to.equal('u')
    expect(data4.active).to.equal(true)

    const data5 = await admin.withRegistry.metadata(admin.withNFT1.address, 3)
    expect(data5.active).to.equal(false)

    const data6 = await admin.withRegistry.metadata(admin.withNFT2.address, 3)
    expect(data6.active).to.equal(false)
  })

  it('Should get owners', async function () {
    const { admin, holder1,  holder2 } = this.signers

    expect(
      await admin.withRegistry.ownerOf(admin.withNFT1.address, 1)
    ).to.equal(holder1.address)

    expect(
      await admin.withRegistry.ownerOf(admin.withNFT1.address, 2)
    ).to.equal(holder1.address)

    expect(
      await admin.withRegistry.ownerOf(admin.withNFT2.address, 1)
    ).to.equal(holder2.address)

    expect(
      await admin.withRegistry.ownerOf(admin.withNFT2.address, 2)
    ).to.equal(holder2.address)

    await expect(//id not exist
      admin.withRegistry.ownerOf(admin.withNFT1.address, 22)
    ).to.be.revertedWith('NonExistentToken()')

    await expect(//id not exist
      admin.withRegistry.ownerOf(admin.withNFT2.address, 22)
    ).to.be.revertedWith('NonExistentToken()')
  })

  it('Should rename', async function () {
    const { admin, holder1 } = this.signers

    await holder1.withRegistry.rename(admin.withNFT1.address, 1, 'z')
    const data1 = await admin.withRegistry.metadata(admin.withNFT1.address, 1)
    expect(data1.name).to.equal('z')
    expect(data1.crew).to.equal('b')
    expect(data1.eyes).to.equal('c')
    expect(data1.head).to.equal('d')
    expect(data1.mask).to.equal('e')
    expect(data1.neck).to.equal('f')
    expect(data1.outerwear).to.equal('g')
    expect(data1.active).to.equal(true)
  })
})