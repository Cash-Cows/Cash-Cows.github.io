const { expect, deploy, bindContract, getRole } = require('../utils')

function parseBigInt(str, base = 10) {
  base = BigInt(base)
  var bigint = BigInt(0)
  for (var i = 0; i < str.length; i++) {
    var code = str[str.length - 1 - i].charCodeAt(0) - 48; if(code >= 10) code -= 39
    bigint += base**BigInt(i) * BigInt(code)
  }
  return bigint
}

function getCollectionId(address, id, base = 10) {
  address = address.replace('0x', '').toLowerCase();
  const addressBin = [];
  for(var c of address) {
    switch(c) {
      case '0': addressBin.push('0000'); break;
      case '1': addressBin.push('0001'); break;
      case '2': addressBin.push('0010'); break;
      case '3': addressBin.push('0011'); break;
      case '4': addressBin.push('0100'); break;
      case '5': addressBin.push('0101'); break;
      case '6': addressBin.push('0110'); break;
      case '7': addressBin.push('0111'); break;
      case '8': addressBin.push('1000'); break;
      case '9': addressBin.push('1001'); break;
      case 'a': addressBin.push('1010'); break;
      case 'b': addressBin.push('1011'); break;
      case 'c': addressBin.push('1100'); break;
      case 'd': addressBin.push('1101'); break;
      case 'e': addressBin.push('1110'); break;
      case 'f': addressBin.push('1111'); break;
      default: return '';
    }
  }

  return parseBigInt([
    id.toString(2).padStart(192, '0'),
    addressBin.join('').padStart(160, '0')
  ].join(''), 2).toString(base)
}

function mintETH(characterId, itemId, price) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'uint256', 'uint256', 'uint256'],
      ['mint', characterId, itemId, price]
    ).slice(2),
    'hex'
  )
}

function mintERC20(token, characterId, itemId, price) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256', 'uint256'],
      ['mint', token, characterId, itemId, price]
    ).slice(2),
    'hex'
  )
}

function redeem(token, itemId, rate) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['redeem', token, itemId, rate]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsGame Tests', function() {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'
    this.zero = '0x0000000000000000000000000000000000000000'

    const nft = await deploy('CashCows', this.preview, signers[0].address)
    await bindContract('withNFT', 'CashCows', nft, signers)
    const dolla = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withDolla', 'CashCowsDolla', dolla, signers)
    const loot = await deploy('CashCowsLoot', this.preview, signers[0].address)
    await bindContract('withLoot', 'CashCowsLoot', loot, signers)
    const game = await deploy('CashCowsGame', signers[0].address)
    await bindContract('withGame', 'CashCowsGame', game, signers)
    const weth = await deploy('MockERC20WETH')
    await bindContract('withWETH', 'MockERC20WETH', weth, signers)

    const [ admin, holder1, holder2 ] = signers

    //grant admin to all roles
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withLoot.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withGame.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withGame.grantRole(getRole('CURATOR_ROLE'), admin.address)
    await admin.withGame.grantRole(getRole('FUNDER_ROLE'), admin.address)
    //allow game to mint and burn dolla
    await admin.withGame.burnable(dolla.address, true)
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), game.address)
    await admin.withDolla.grantRole(getRole('BURNER_ROLE'), game.address)
    //allow game to mint and transfer loot
    await admin.withLoot.grantRole(getRole('MINTER_ROLE'), game.address)
    await admin.withLoot.grantRole(getRole('APPROVED_ROLE'), game.address)
    //mint dolla for holder
    await admin.withDolla.mint(holder1.address, 100)
    await admin.withDolla.mint(holder2.address, 200)
    //mint cows to holders
    await admin.withNFT['mint(address,uint256)'](holder1.address, 10)
    await admin.withNFT['mint(address,uint256)'](holder2.address, 10)
    //add items to loot store
    await admin.withLoot['setMaxSupply(uint256[],uint256[])']([1, 2], [6, 3])
    
    this.signers = { admin, holder1, holder2 }
  })

  it('Should link', async function () {
    const { admin, holder1, holder2 } = this.signers
    
    await (async () => {
      //holder1 (self) attach item 1 to character 1
      //1. item mint
      await admin.withLoot['mint(address,uint256,uint256,bytes)'](holder1.address, 1, 2, [])
      const characterId = getCollectionId(admin.withNFT.address, 1)
      const itemId = getCollectionId(admin.withLoot.address, 1)
      //2. link item with character
      await holder1.withGame.link(characterId, itemId, [])
      expect(await admin.withGame.linkedSince(characterId, itemId)).to.be.above(
        Math.floor(Date.now() / 1000)
      )
    })()

    await (async () => {
      //holder2 (gift) attach item 2 to character 1
      //1. item mint
      await admin.withLoot['mint(address,uint256,uint256,bytes)'](holder2.address, 2, 2, [])
      const characterId = getCollectionId(admin.withNFT.address, 1)
      const itemId = getCollectionId(admin.withLoot.address, 2)
      //2. link item with character
      await holder2.withGame.link(characterId, itemId, [])
      expect(await admin.withGame.linkedSince(characterId, itemId)).to.be.above(
        Math.floor(Date.now() / 1000)
      )
    })()
  })

  it('Should not link', async function () {
    const { admin, holder1 } = this.signers
    
    await expect(//already linked
      holder1.withGame.link(
        getCollectionId(admin.withNFT.address, 1), 
        getCollectionId(admin.withLoot.address, 1), 
        []
      )
    ).to.be.revertedWith('InvalidCall()')

    await expect(//does not own item
      holder1.withGame.link(
        getCollectionId(admin.withNFT.address, 1), 
        getCollectionId(admin.withLoot.address, 3), 
        []
      )
    ).to.be.revertedWith('ERC1155: insufficient balance for transfer')

    await expect(//not a real character
      holder1.withGame.safeLink(1, getCollectionId(admin.withNFT.address, 1), [])
    ).to.be.reverted
  })

  it('Should mint (eth)', async function () {
    const { admin, holder2 } = this.signers

    const characterId = getCollectionId(admin.withNFT.address, 11)
    const itemId = getCollectionId(admin.withLoot.address, 1)
    //mint character 11 item 1 (price 10)
    await holder2.withGame['mint(uint256,uint256,uint256,bytes)'](
      characterId, itemId, 10, await admin.signMessage(
        mintETH(characterId, itemId, 10)
      ), { value: 20 }
    )

    expect(await admin.withGame.linkedSince(characterId, itemId)).to.be.above(
      Math.floor(Date.now() / 1000)
    )
  })

  it('Should mint (dolla)', async function () {
    const { admin, holder1 } = this.signers

    const characterId = getCollectionId(admin.withNFT.address, 2)
    const itemId = getCollectionId(admin.withLoot.address, 1)
    const token = admin.withDolla.address
    //mint character 2 item 1 (price 20)
    await holder1.withGame['mint(address,uint256,uint256,uint256,bytes)'](
      token, characterId, itemId, 20, await admin.signMessage(
        mintERC20(token, characterId, itemId, 20)
      )
    )

    expect(await admin.withGame.linkedSince(characterId, itemId)).to.be.above(
      Math.floor(Date.now() / 1000)
    )
    expect(await admin.withDolla.balanceOf(holder1.withGame.address)).to.equal(0)
  })

  it('Should mint (weth)', async function () {
    const { admin, holder1 } = this.signers

    await admin.withWETH.mint(holder1.address, 100)
    await holder1.withWETH.approve(admin.withGame.address, 100)
    await admin.withLoot['setMaxSupply(uint256[],uint256[])']([3], [3])
    
    const characterId = getCollectionId(admin.withNFT.address, 3)
    const itemId = getCollectionId(admin.withLoot.address, 3)
    const token = admin.withWETH.address
    
    //mint character 3 item 3 of item 3 (price 30)
    await holder1.withGame['mint(address,uint256,uint256,uint256,bytes)'](
      token, characterId, itemId, 30, await admin.signMessage(
        mintERC20(token, characterId, itemId, 30)
      )
    )

    expect(await admin.withGame.linkedSince(characterId, itemId)).to.be.above(
      Math.floor(Date.now() / 1000)
    )
    expect(await admin.withWETH.balanceOf(holder1.withGame.address)).to.equal(30)

    const items = await admin.withGame.items(characterId)
    expect(items[0].collectionAddress).to.equal(admin.withLoot.address)
    expect(items[0].collectionTokenId).to.equal(3)
    expect(items.length).to.equal(1)
  })

  it('Should not unlink', async function () {
    const { admin, holder1, holder2 } = this.signers

    const characterId = getCollectionId(admin.withNFT.address, 2)
    const itemId = getCollectionId(admin.withLoot.address, 1)
    //mint character 2 item 2 of item 1 (price 10)
    await expect(
      holder1.withGame['unlink(uint256,uint256,address,bytes)'](
        characterId, itemId, holder2.address, []
      )
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should unlink', async function () {
    const { admin, holder1, holder2 } = this.signers

    expect(await admin.withLoot.balanceOf(holder2.address, 1)).to.equal(0)

    const characterId = getCollectionId(admin.withNFT.address, 1)
    const itemId = getCollectionId(admin.withLoot.address, 1)
    await admin.withGame.unlinkable(itemId, true)
    await holder1.withGame['unlink(uint256,uint256,address,bytes)'](
      characterId, itemId, holder2.address, []
    )

    expect(await admin.withLoot.balanceOf(holder2.address, 1)).to.equal(1)
  })

  it('Should withdraw funds', async function () {
    const { admin, holder1 } = this.signers

    expect(await ethers.provider.getBalance(admin.withGame.address)).to.equal(20)
    const ethBalance = await holder1.getBalance()
    await admin.withGame['withdraw(address)'](holder1.address)
    expect((await holder1.getBalance()).sub(ethBalance).toString()).to.be.equal('20')

    expect(await admin.withWETH.balanceOf(admin.withGame.address)).to.equal(30)
    await admin.withGame['withdraw(address,address,uint256)'](admin.withWETH.address, holder1.address, 30)
    expect(await admin.withWETH.balanceOf(holder1.address)).to.be.equal(100)
  })

  it('Should redeem', async function () {
    const { admin, holder2 } = this.signers

    expect(//already unlinked
      await admin.withGame['redeemable(address,uint256,uint256,uint256)'](
        admin.withDolla.address, 
        getCollectionId(admin.withNFT.address, 1), 
        getCollectionId(admin.withLoot.address, 1), 
        10
      )
    ).to.equal(0)

    const start = await admin.withGame.linkedSince(
      getCollectionId(admin.withNFT.address, 11), 
      getCollectionId(admin.withLoot.address, 1)
    )

    expect(//only 10 sec passed
      await admin.withGame['redeemable(address,uint256,uint256,uint256,uint256)'](
        admin.withDolla.address, 
        getCollectionId(admin.withNFT.address, 11), 
        getCollectionId(admin.withLoot.address, 1), 
        start.add(10),
        10
      )
    ).to.equal(100)

    const balance = await holder2.withDolla.balanceOf(holder2.address)

    await holder2.withGame.redeem(
      admin.withDolla.address,
      getCollectionId(admin.withNFT.address, 11), 
      getCollectionId(admin.withLoot.address, 1), 
      10,
      await admin.signMessage(
        redeem(
          admin.withDolla.address, 
          getCollectionId(admin.withLoot.address, 1), 
          10
        )
      )
    )

    expect(
      (await holder2.withDolla.balanceOf(holder2.address)).sub(balance)
    ).to.equal(110)
  })
})