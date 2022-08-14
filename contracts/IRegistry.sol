// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRegistry {
  /**
   * @dev Returns the trait `index` value of a `collection` `tokenId`
   */
  function traitOf(
    address collection, 
    uint256 tokenId,
    uint256 index
  ) external view returns(uint256);

  /**
   * @dev Returns the trait `index` value of a `collectionId`
   */
  function traitOf(
    uint256 collectionId,
    uint256 index
  ) external view returns(uint256);

  /**
   * @dev Returns the trait `index` value of a `collection` `tokenId`
   */
  function traitsOf(
    address collection, 
    uint256 tokenId
  ) external view returns(uint256);

  /**
   * @dev Returns the trait `index` value of a `collectionId`
   */
  function traitsOf(uint256 collectionId) external view returns(uint256);
}