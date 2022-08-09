const { expect, deploy, bindContract, getRole } = require('../utils');

describe('CashCowsDolla Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners()

    const token = await deploy('CashCowsDolla', signers[0].address)
    await bindContract('withToken', 'CashCowsDolla', token, signers)

    const [ 
      admin, 
      holder1, 
      holder2, 
      holder3, 
      holder4
    ] = signers

    //grant admin to all roles
    await admin.withToken.grantRole(
      getRole('MINTER_ROLE'), 
      admin.address
    )
    await admin.withToken.grantRole(
      getRole('PAUSER_ROLE'), 
      admin.address
    )

    this.signers = {
      admin, 
      holder1, 
      holder2, 
      holder3, 
      holder4
    }
  })

  it('Should mint', async function () {
    const { admin, holder1 } = this.signers

    await admin.withToken.mint(holder1.address, ethers.utils.parseEther('10'))
    expect(await admin.withToken.balanceOf(holder1.address)).to.equal(
      ethers.utils.parseEther('10')
    )
  })
  
  it('Should transfer', async function () {
    const { admin, holder1, holder2 } = this.signers

    await holder1.withToken.transfer(holder2.address, ethers.utils.parseEther('5'))
    expect(await admin.withToken.balanceOf(holder1.address)).to.equal(
      ethers.utils.parseEther('5')
    )

    expect(await admin.withToken.balanceOf(holder2.address)).to.equal(
      ethers.utils.parseEther('5')
    )
  })

  it('Should not transfer when paused', async function () {
    const { admin, holder1, holder2 } = this.signers
    await admin.withToken.pause()
    await expect(
      holder1.withToken.transfer(holder2.address, ethers.utils.parseEther('5'))
    ).to.revertedWith('InvalidCall()')
  })

  it('Should not mint when paused', async function () {
    const { admin, holder1 } = this.signers
    await expect(
      admin.withToken.mint(holder1.address, ethers.utils.parseEther('10'))
    ).to.revertedWith('Pausable: paused')
  })
})