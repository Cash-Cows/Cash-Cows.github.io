const { expect, deploy, bindContract, getRole } = require('../utils');

describe('CashCowsMarket Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const milk = await deploy('CashCowsMilk', signers[0].address)
    await bindContract('withMilk', 'CashCowsMilk', milk, signers)

    const dolla = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withDolla', 'CashCowsDolla', dolla, signers)

    const market = await deploy('CashCowsMarket', milk.address, dolla.address)
    await bindContract('withMarket', 'CashCowsMarket', market, signers)

    const [ admin, holder ] = signers

    //grant market to all roles
    await admin.withMilk.grantRole(getRole('MINTER_ROLE'), market.address)
    await admin.withMilk.grantRole(getRole('BURNER_ROLE'), market.address)
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), market.address)
    await admin.withDolla.grantRole(getRole('BURNER_ROLE'), market.address)
    //grant admin minter roles
    await admin.withMilk.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withDolla.grantRole(getRole('MINTER_ROLE'), admin.address)

    //mint milk for holder
    await admin.withMilk.mint(holder.address, 1)
    //set exchange rate
    await admin.withMarket.setExchangeRate(100)

    this.signers = { admin, holder }
  })

  it('Should exchange milk for dolla', async function () {
    const { admin, holder } = this.signers

    await holder.withMarket.toDolla(1)
    expect(await admin.withMilk.balanceOf(holder.address)).to.equal(0)
    expect(await admin.withDolla.balanceOf(holder.address)).to.equal(100)
  })

  it('Should exchange dolla for milk', async function () {
    const { admin, holder } = this.signers

    await holder.withMarket.toMilk(100)
    expect(await admin.withMilk.balanceOf(holder.address)).to.equal(1)
    expect(await admin.withDolla.balanceOf(holder.address)).to.equal(0)
  })
})