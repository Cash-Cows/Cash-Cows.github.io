// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRoyaltySplitter {
  // ============ Errors ============

  error InvalidCall();

  // ============ Events ============

  event PaymentReleased(address to, uint256 amount);
  event ERC20PaymentReleased(IERC20 indexed token, address to, uint256 amount);
  event PaymentReceived(address from, uint256 amount);

  // ============ Read Methods ============

  /**
   * @dev Getter for the address of the payee via `tokenId`.
   */
  function payee(uint256 tokenId) external view returns(address);

  /**
   * @dev Determines how much ETH are releaseable for `tokenId`
   */
  function releaseable(uint256 tokenId) external view returns(uint256);

  /**
   * @dev Determines how much ERC20 `token` are releaseable for `tokenId`
   */
  function releaseable(IERC20 token, uint256 tokenId) external view returns(uint256);

  /**
   * @dev Getter for the amount of shares held by an account.
   */
  function shares() external view returns(uint256);

  /**
   * @dev Getter for the amount of shares held by an account.
   */
  function shares(address account) external view returns(uint256);

  /**
   * @dev Getter for the total amount of Ether already released.
   */
  function totalReleased() external view returns(uint256);

  /**
   * @dev Getter for the total amount of `token` already released. 
   * `token` should be the address of an IERC20 contract.
   */
  function totalReleased(IERC20 token) external view returns(uint256);
}