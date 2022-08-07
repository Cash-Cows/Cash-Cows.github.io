// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRegistry {
  // ============ Struct ============

  struct Metadata {
    string name;
    string crew;
    string eyes;
    string head;
    string mask;
    string neck;
    string outerwear;
    bool active;
  }

  // ============ Read Methods ============

  /**
   * @dev Returns the metadata of a `collections`s `token`
   */
  function metadata(
    address collection, 
    uint256 tokenId
  ) external view returns(Metadata memory);

  /**
   * @dev Returns the owner of a `collections`s `token`
   */
  function ownerOf(
    address collection, 
    uint256 tokenId
  ) external view returns(address);
}