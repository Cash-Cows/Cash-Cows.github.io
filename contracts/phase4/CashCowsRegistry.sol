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

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../IRegistry.sol";

// ============ Contract ============

/**
 * @dev Register your cow to activate your special abilities in game.
 * Abilities are based on collection and crew
 */
contract CashCowsRegistry is AccessControl, IRegistry {

  // ============ Errors ============

  error InvalidCall();

  // ============ Constants ============

  //roles
  bytes32 internal constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");

  // Collection Token Bits Layout:
  // - [0..159]   `address of collection`
  // - [160..] `tokenId`

  //length of token in packed data
  uint256 private constant _BIT_TOKEN_MASK = (1 << 192) - 1;
  //length of collection in packed data
  uint256 private constant _BIT_COLLECTION_MASK = (1 << 160) - 1;
  //position of token in packed data
  uint256 private constant _BIT_TOKEN_POSITION = 160;

  // Traits Bits Layout:
  // - [0..8...16...]   `per feature 32 features max`
  //length of collection in packed data
  uint256 private constant _BIT_TRAIT_MASK = (1 << 8) - 1;
  //position of token in packed data
  uint256 private constant _BIT_TRAIT_POSITION = 8;

  // ============ Storage ============

  //mapping of packed collection token to packed metadata
  mapping(uint256 => uint256) private _registry;

  // ============ Deploy ============

  /**
   * @dev Sets the default admin so they can add the authorize role
   */
  constructor(address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
  }

  // ============ Read Methods ============

  /**
   * @dev Returns the trait `index` value of a `collection` `tokenId`
   */
  function traitOf(
    address collection, 
    uint256 tokenId,
    uint256 index
  ) external view returns(uint256) {
    return traitOf(_packCollection(collection, tokenId), index);
  }

  /**
   * @dev Returns the trait `index` value of a `collectionId`
   */
  function traitOf(
    uint256 collectionId,
    uint256 index
  ) public view returns(uint256) {
    return _unpackTrait(traitsOf(collectionId), index);
  }

  /**
   * @dev Returns the trait `index` value of a `collection` `tokenId`
   */
  function traitsOf(
    address collection, 
    uint256 tokenId
  ) external view returns(uint256) {
    return traitsOf(_packCollection(collection, tokenId));
  }

  /**
   * @dev Returns the trait `index` value of a `collectionId`
   */
  function traitsOf(uint256 collectionId) public view returns(uint256) {
    return _registry[collectionId];
  }

  // ============ Write Methods ============

  /**
   * @dev Allows anyone to register their nft. Must be approved by signer
   * Signatures will be encoded once per nft and available on dApp
   */
  function register(
    address collection, 
    uint256 tokenId,
    uint256 metadata,
    bytes memory proof
  ) external {
    register(_packCollection(collection, tokenId), metadata, proof);
  }

  /**
   * @dev Allows anyone to register their nft. Must be approved by signer
   * Signatures will be encoded once per nft and available on dApp
   */
  function register(
    uint256 collectionId, 
    uint256 metadata,
    bytes memory proof
  ) public {
    //revert if invalid proof
    if (!hasRole(_CURATOR_ROLE, ECDSA.recover(
      ECDSA.toEthSignedMessageHash(
        keccak256(abi.encodePacked(
          "register", 
          collectionId, 
          metadata
        ))
      ),
      proof
    ))) revert InvalidCall();
    
    _registry[collectionId] = metadata;
  }

  // ============ Admin Methods ============

  /**
   * @dev Allows anyone to register their nft. Must be approved by signer
   * Signatures will be encoded once per nft and available on dApp
   */
  function register(
    address collection, 
    uint256 tokenId,
    uint256 metadata
  ) external {
    return register(_packCollection(collection, tokenId), metadata);
  }

  /**
   * @dev Allows anyone to register their nft. Must be approved by signer
   * Signatures will be encoded once per nft and available on dApp
   */
  function register(
    uint256 collectionId, 
    uint256 metadata
  ) public onlyRole(_CURATOR_ROLE) {
    _registry[collectionId] = metadata;
  }

  // ============ Pack Methods ============

  /**
   * @dev Packs collection data into a single uint256.
   */
  function _packCollection(
    address collection, 
    uint256 tokenId
  ) internal pure returns(uint256 result) {
    uint256 ownerId;
    assembly {
      ownerId := and(collection, _BIT_COLLECTION_MASK)
    }

    result = (ownerId & _BIT_TOKEN_MASK) | (tokenId << _BIT_TOKEN_POSITION);
  }

  /**
   * @dev Unpacks collection address from uint256 `packed` collection data
   */
  function _unpackCollectionAddress(
    uint256 packed
  ) internal pure returns(address) {
    return address(uint160(packed & _BIT_COLLECTION_MASK));
  }

  /**
   * @dev Unpacks token id from uint256 `packed` collection data
   */
  function _unpackCollectionToken(
    uint256 packed
  ) internal pure returns(uint256) {
    return (packed >> _BIT_TOKEN_POSITION) & _BIT_COLLECTION_MASK;
  }

  /**
   * @dev Unpacks trait id from uint256 `packed` trait data
   */
  function _unpackTrait(
    uint256 packed, 
    uint256 index
  ) internal pure returns(uint256) {
    return (packed >> (_BIT_TRAIT_POSITION * index)) & _BIT_TRAIT_MASK;
  }
}