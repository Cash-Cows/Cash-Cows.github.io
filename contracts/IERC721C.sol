// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC721C is IERC721 {
  /**
   * @dev Returns the address of token id burned
   */
  function burnerOf(uint256 tokenId) external view returns(address);

  /**
   * @dev Returns the last id issued
   */
  function lastId() external view returns(uint256);
  
  /**
   * @dev Returns true if `owner` owns all the `tokenIds`.
   * Will error if one of the token is burnt
   */
  function ownsAll(address owner, uint256[] memory tokenIds) external view returns(bool);

  /**
   * @dev Returns all the owner's tokens. This is an incredibly 
   * ineffecient method and should not be used by other contracts.
   * It's recommended to call this on your dApp then call `ownsAll`
   * from your other contract instead.
   */
  function ownerTokens(address owner) external view returns(uint256[] memory);

  /**
   * @dev Returns the overall amount of tokens burned
   */
  function totalBurned() external view returns(uint256);

  /**
   * @dev Shows the overall amount of tokens generated in the contract
   */
  function totalSupply() external view returns(uint256);
}