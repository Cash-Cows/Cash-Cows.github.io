// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev USDT mock token
 */
contract MockERC20WETH is ERC20 {
  /**
   * @dev Sets the name and symbol. Grants `DEFAULT_ADMIN_ROLE` to 
   * the account that deploys the contract.
   */
  constructor() ERC20("Mock WETH", "WETH") {}

  /**
   * @dev Creates `amount` new tokens.
   */
  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
