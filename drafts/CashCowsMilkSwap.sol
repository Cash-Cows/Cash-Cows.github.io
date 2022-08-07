// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//-------------------------------------------------------------------------------------------
//
//   /$$$$$$                      /$$              /$$$$$$                                   
//  /$$__  $$                    | $$             /$$__  $$                                  
// | $$  \__/  /$$$$$$   /$$$$$$$| $$$$$$$       | $$  \__/  /$$$$$$  /$$  /$$  /$$  /$$$$$$$
// | $$       |____  $$ /$$_____/| $$__  $$      | $$       /$$__  $$| $$ | $$ | $$ /$$_____/
// | $$        /$$$$$$$|  $$$$$$ | $$  \ $$      | $$      | $$  \ $$| $$ | $$ | $$|  $$$$$$ 
// | $$    $$ /$$__  $$ \____  $$| $$  | $$      | $$    $$| $$  | $$| $$ | $$ | $$ \____  $$
// |  $$$$$$/|  $$$$$$$ /$$$$$$$/| $$  | $$      |  $$$$$$/|  $$$$$$/|  $$$$$/$$$$/ /$$$$$$$/
//  \______/  \_______/|_______/ |__/  |__/       \______/  \______/  \_____/\___/ |_______/
//
//-------------------------------------------------------------------------------------------
//
// Moo.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

// ============ Errors ============

error InvalidAmount();

// ============ Contract ============

contract Arkonomy is
  Initializable,
  AccessControl,
  ReentrancyGuard,
  Pausable
{
  using Address for address;
  using SafeMath for uint256;

  // ============ Events ============

  event ERC20Received(address indexed sender, uint256 amount);
  event ERC20Sent(address indexed recipient, uint256 amount);
  event DepositReceived(address from, uint256 amount);

  // ============ Constants ============

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  //this is the token address
  IERC20 public TOKEN;

  // ============ Store ============

  //where 5000 = 50.00%
  uint16 private _interest;
  //where 20000 = 200.00%
  uint16 private _sellFor;
  //where 5000 = 50.00%
  uint16 private _buyFor;

  // ============ Deploy ============

  /**
   * @dev Grants `DEFAULT_ADMIN_ROLE` to the account that deploys the 
   * contract.
   */
  function initialize(
    IERC20 token, 
    address admin
  ) public initializer {
    //set up roles for the contract creator
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _setupRole(PAUSER_ROLE, admin);
    //set the $AOD addresses
    TOKEN = token;

    // Setup private values
    _interest = 5000;
    _sellFor = 20000;
    _buyFor = 5000;

    //start paused
    _pause();
  }

  /**
   * @dev The Ether received will be logged with {PaymentReceived} 
   * events. Note that these events are not fully reliable: it's 
   * possible for a contract to receive Ether without triggering this 
   * function. This only affects the reliability of the events, and not 
   * the actual splitting of Ether.
   *
   * To learn more about this see the Solidity documentation for
   * https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function[fallback
   * functions].
   */
  receive() external payable {
    emit DepositReceived(_msgSender(), msg.value);
  }

  /**
   * @dev Required method for upgradeable contracts
   */

  // solhint-disable-next-line no-empty-blocks
  function _authorizeUpgrade(
    address newImplementation
  ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

  // ============ Read Methods ============

  /**
   * @dev Returns the ether balance
   */
  function balanceEther() public view returns(uint256) {
    return address(this).balance;
  }

  /**
   * @dev Returns the $AOD token balance
   */
  function balanceToken() public view returns(uint256) {
    return TOKEN.balanceOf(address(this));
  }

  /**
   * @dev Returns the ether amount we are willing to buy $AOD for
   */
  function buyingFor(uint256 amount) public view returns(uint256) {
    return _buyingFor(amount, balanceEther());
  }

  /**
   * @dev Returns the ether amount we are willing to sell $AOD for
   */
  function sellingFor(uint256 amount) public view returns(uint256) {
    return _sellingFor(amount, balanceEther());
  }

  // ============ Write Methods ============

  /**
   * @dev Buys `amount` of $AOD 
   */
  function buy(
    address recipient, 
    uint256 amount
  ) external payable whenNotPaused nonReentrant {
    uint256 value = _sellingFor(amount, balanceEther() - msg.value);
    if (value == 0 
      || msg.value < value
      || balanceToken() < amount
    ) revert InvalidAmount();
    //we already received the ether
    //so just send the tokens
    SafeERC20.safeTransfer(TOKEN, recipient, amount);
    //send the interest
    Address.sendValue(
      payable(TREASURY),
      msg.value.mul(_interest).div(10000)
    );
    emit ERC20Sent(recipient, amount);
  }

  /**
   * @dev Sells `amount` of $AOD 
   */
  function sell(
    address recipient, 
    uint256 amount
  ) external whenNotPaused nonReentrant {
    //check allowance
    if(TOKEN.allowance(recipient, address(this)) < amount) 
      revert InvalidAmount();
    //send the ether
    Address.sendValue(payable(recipient), buyingFor(amount));
    //now accept the payment
    SafeERC20.safeTransferFrom(
      TOKEN, 
      recipient, 
      address(this), 
      amount
    );
    emit ERC20Received(recipient, amount);
  }

  // ============ Admin Methods ============

  /**
   * @dev Sets the buy for percent
   */
  function buyFor(uint16 percent) 
    external payable onlyRole(DEFAULT_ADMIN_ROLE) 
  {
    _buyFor = percent;
  }

  /**
   * @dev Sets the interest
   */
  function interest(uint16 percent) 
    external payable onlyRole(DEFAULT_ADMIN_ROLE) 
  {
    _interest = percent;
  }

  /**
   * @dev Pauses all token transfers.
   */
  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Sets the sell for percent
   */
  function sellFor(uint16 percent) 
    external payable onlyRole(DEFAULT_ADMIN_ROLE) 
  {
    _sellFor = percent;
  }

  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  // ============ Internal Methods ============
  /**
   * @dev Returns the ether amount we are willing to buy $AOD for
   */
  function _buyingFor(uint256 amount, uint256 balance) internal view returns(uint256) {
    // (eth / cap) * amount
    return balance.mul(amount).mul(_buyFor).div(TOKEN_CAP).div(1000);
  }

  /**
   * @dev Returns the ether amount we are willing to sell $AOD for
   */
  function _sellingFor(uint256 amount, uint256 balance) internal view returns(uint256) {
    // (eth / cap) * amount
    return balance.mul(amount).mul(_sellFor).div(TOKEN_CAP).div(1000);
  }
}