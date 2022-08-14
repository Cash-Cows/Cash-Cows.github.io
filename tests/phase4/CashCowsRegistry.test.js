const { expect, deploy, bindContract, getRole } = require('../utils');
const database = require('../../docs/data/metadata.json')
const traitmap = require('../../docs/data/traitmap.json')

function authorize(collectionId, metadata) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      [ 'string', 'uint256', 'uint256' ],
      [ 'register', collectionId, metadata ]
    ).slice(2),
    'hex'
  )
}

describe('CashCowsRegistry Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()
    const registry = await deploy('CashCowsRegistry', signers[0].address)
    await bindContract('withRegistry', 'CashCowsRegistry', registry, signers)
    const [ admin ] = signers
    //grant admin to all roles
    await admin.withRegistry.grantRole(getRole('CURATOR_ROLE'), admin.address)
    this.signers = { admin }
  })

  it('Should register', async function () {
    const { admin } = this.signers
    let row = database.rows[0]
    await admin.withRegistry['register(address,uint256,uint256)'](admin.address, row.edition, row.traitId)
    let index = 0
    for (const trait in row.attributes) {
      if (trait == 'Level') continue
      expect(
        await admin.withRegistry['traitOf(address,uint256,uint256)'](admin.address, row.edition, index++)
      ).to.equal(traitmap[trait][row.attributes[trait]])
    }

    row = database.rows[1]
    await admin.withRegistry['register(uint256,uint256)'](row.collectionId, row.traitId)
    index = 0
    for (const trait in row.attributes) {
      if (trait == 'Level') continue
      expect(
        await admin.withRegistry['traitOf(uint256,uint256)'](row.collectionId, index++)
      ).to.equal(traitmap[trait][row.attributes[trait]])
    }

    row = database.rows[2]
    await admin.withRegistry['register(uint256,uint256,bytes)'](
      row.collectionId, row.traitId, await admin.signMessage(
        authorize(row.collectionId, row.traitId)
      )
    )
    index = 0
    for (const trait in row.attributes) {
      if (trait == 'Level') continue
      expect(
        await admin.withRegistry['traitOf(address,uint256,uint256)'](
          '0x1A371de4634c3DEBf7196A1EFc59e620aff0915F', 
          row.edition, 
          index++
        )
      ).to.equal(traitmap[trait][row.attributes[trait]])
    }

    row = database.rows[3]
    await admin.withRegistry['register(address,uint256,uint256,bytes)'](
      '0x1A371de4634c3DEBf7196A1EFc59e620aff0915F', 
      row.edition, 
      row.traitId, 
      await admin.signMessage(
        authorize(row.collectionId, row.traitId)
      )
    )
    index = 0
    for (const trait in row.attributes) {
      if (trait == 'Level') continue
      expect(
        await admin.withRegistry['traitOf(uint256,uint256)'](
          row.collectionId, 
          index++
        )
      ).to.equal(traitmap[trait][row.attributes[trait]])
    }
  })
})