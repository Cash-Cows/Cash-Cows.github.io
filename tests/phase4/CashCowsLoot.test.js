const { expect, deploy, bindContract, getRole } = require('../utils')

function mint(collection, token, lootId, payment, price) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      [ 'string', 'address', 'uint256', 'uint256', 'address', 'uint256' ],
      [ 'mint', collection, token, lootId, payment, price ]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsLoot Tests', function() {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft1 = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT1', 'CashCows', nft1, signers)
    const dolla = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withDolla', 'CashCowsDolla', dolla, signers)
    const loot = await deploy('CashCowsLoot', signers[0].address)
    await bindContract('withLoot', 'CashCowsLoot', loot, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT1.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT1.grantRole(getRole('CURATOR_ROLE'), admin.address)

    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('FUNDER_ROLE'), admin.address)

    //allow loot to burn dolla
    await admin.withDolla.grantRole(getRole('BURNER_ROLE'), loot.address)
    
    //mint dolla for holder
    await admin.withLoot.burnTokens(admin.withDolla.address, true)
    await admin.withDolla.mint(holder1.address, 100)

    //mint to owners
    await admin.withNFT1['mint(address,uint256)'](holder1.address, 10)
    
    this.signers = { admin, holder1, holder2 }
    this.zero = '0x0000000000000000000000000000000000000000'
  })

  it('Should add loot', async function () {
    const { admin } = this.signers

    await admin.withLoot.add('https://ipfs.io/ipfs/Qm123abc/1.json', 3)
    await admin.withLoot.add('https://ipfs.io/ipfs/Qm123abc/2.json', 1)
    await admin.withLoot.add('https://ipfs.io/ipfs/Qm123abc/4.json', 100)

    expect(await admin.withLoot.lastLootId()).to.equal(3)
    expect(await admin.withLoot.lootURI(1)).to.equal('https://ipfs.io/ipfs/Qm123abc/1.json')
    expect(await admin.withLoot.lootURI(2)).to.equal('https://ipfs.io/ipfs/Qm123abc/2.json')
    expect(await admin.withLoot.lootURI(3)).to.equal('https://ipfs.io/ipfs/Qm123abc/4.json')

    expect(await admin.withLoot.maxSupply(1)).to.equal(3)
    expect(await admin.withLoot.maxSupply(2)).to.equal(1)
    expect(await admin.withLoot.maxSupply(3)).to.equal(100)

    await admin.withLoot.updateURI(3, 'https://ipfs.io/ipfs/Qm123abc/3.json')
    expect(await admin.withLoot.lootURI(3)).to.equal('https://ipfs.io/ipfs/Qm123abc/3.json')
    
    await admin.withLoot.updateMaxSupply(3, 0)
    expect(await admin.withLoot.maxSupply(3)).to.equal(0)
  })

  it('Should mint for eth', async function () {
    const { admin, holder1 } = this.signers
    const collection = admin.withNFT1.address
    const ethProof = await admin.signMessage(mint(collection, 1, 1, this.zero, 10))
    await holder1.withLoot['mint(address,uint256,uint256,uint256,bytes)'](collection, 1, 1, 10, ethProof, {
      value: 10
    })

    expect(await admin.withLoot.exists(collection, 1, 1)).to.equal(true)
    expect(await admin.withLoot.lootOf(1)).to.equal(1) //loot of token id -> loot id
    expect((await admin.withLoot.loots(collection, 1))[0]).to.equal(1)
    expect(await admin.withLoot.tokenURI(1)).to.equal('https://ipfs.io/ipfs/Qm123abc/1.json')
    expect(await admin.withLoot['totalSupply(uint256)'](1)).to.equal(1) //total supply of loot id
    expect(await admin.withLoot.ownerOf(1)).to.equal(holder1.address)
    expect(await admin.withLoot.lastOwnerOf(1)).to.equal(holder1.address)
    expect(await admin.withLoot['totalSupply()']()).to.equal(1)
    await (async() => {
      const cross = await admin.withLoot.collectionOf(1)
      expect(cross.collection).to.equal(collection)
      expect(cross.token).to.equal(1)
    })()

  })

  it('Should mint for dolla', async function () {
    const { admin, holder1 } = this.signers
    const collection = admin.withNFT1.address
    const proof = await admin.signMessage(
      mint(collection, 1, 2, admin.withDolla.address, 10)
    )
    await holder1.withLoot['mint(address,uint256,uint256,address,uint256,bytes)'](
      collection, 1, 2, admin.withDolla.address, 10, proof
    )

    expect(await admin.withLoot.exists(collection, 1, 2)).to.equal(true)
    expect(await admin.withLoot.lootOf(2)).to.equal(2) //loot of token id -> loot id
    expect((await admin.withLoot.loots(collection, 1))[0]).to.equal(1)
    expect((await admin.withLoot.loots(collection, 1))[1]).to.equal(2)
    expect(await admin.withLoot.tokenURI(2)).to.equal('https://ipfs.io/ipfs/Qm123abc/2.json')
    expect(await admin.withLoot['totalSupply(uint256)'](2)).to.equal(1) //total supply of loot id
    expect(await admin.withLoot.ownerOf(2)).to.equal(holder1.address)
    expect(await admin.withLoot.lastOwnerOf(2)).to.equal(holder1.address)
    expect(await admin.withLoot['totalSupply()']()).to.equal(2)
    await (async() => {
      const cross = await admin.withLoot.collectionOf(2)
      expect(cross.collection).to.equal(collection)
      expect(cross.token).to.equal(1)
    })()
  })

  it('Should transfer', async function () {
    const { admin, holder1, holder2 } = this.signers
    await holder1.withNFT1.transferFrom(holder1.address, holder2.address, 1)
    await admin.withLoot['transferFrom(address,uint256,uint256)'](holder1.withNFT1.address, 1, 1)
    await admin.withLoot['transferFrom(address,uint256,uint256)'](holder1.withNFT1.address, 1, 2)
    expect(await admin.withLoot.lastOwnerOf(2)).to.equal(holder2.address)
  })

  it('Should burn', async function () {
    const { admin, holder2 } = this.signers
    await holder2.withNFT1.burn(1)
    await admin.withLoot['burn(uint256)'](1)
    await admin.withLoot['burn(uint256)'](2)
    expect(await admin.withLoot.lastOwnerOf(2)).to.equal(this.zero)
  })
})