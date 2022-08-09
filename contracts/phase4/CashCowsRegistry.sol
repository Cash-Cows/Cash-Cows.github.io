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
  bytes32 internal constant _AUTHORIZE_ROLE = keccak256("AUTHORIZE_ROLE");

  // ============ Storage ============

  mapping(address => mapping(uint256 => Metadata)) private _registry;

  // ============ Deploy ============

  /**
   * @dev Sets the default admin so they can add the authorize role
   */
  constructor(address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
  }

  // ============ Read Methods ============

  /**
   * @dev Returns the metadata of a `collections`s `token`
   */
  function metadata(
    address collection, 
    uint256 tokenId
  ) external view returns(Metadata memory) {
    return _registry[collection][tokenId];
  }

  /**
   * @dev Returns the owner of a `collections`s `token`
   */
  function ownerOf(
    address collection, 
    uint256 tokenId
  ) public view returns(address) {
    return IERC721(collection).ownerOf(tokenId);
  }

  // ============ Write Methods ============

  /**
   * @dev Allows anyone to register their nft. Must be approved by signer
   * Signatures will be encoded once per nft and available on dApp
   */
  function register(
    IERC721 collection, 
    uint256 tokenId, 
    string memory name,
    string memory crew,
    string memory eyes,
    string memory head,
    string memory mask,
    string memory neck,
    string memory outerwear,
    bytes memory proof
  ) external {
    //revert if invalid proof
    if (!hasRole(_AUTHORIZE_ROLE, ECDSA.recover(
      ECDSA.toEthSignedMessageHash(
        keccak256(abi.encodePacked(
          "registry", 
          address(collection), 
          tokenId, 
          name,
          crew,
          eyes,
          head,
          mask,
          neck,
          outerwear
        ))
      ),
      proof
    ))) revert InvalidCall();
    //add to registry
    _registry[address(collection)][tokenId] = Metadata(
      name,
      crew,
      eyes,
      head,
      mask,
      neck,
      outerwear,
      true
    );
  }

  /**
   * @dev Allows owner to change name
   */
  function rename(
    address collection, 
    uint256 tokenId, 
    string memory name
  ) external {
    //revert if not registered
    if (!_registry[address(collection)][tokenId].active
      //or the caller is not the sender
      || ownerOf(collection, tokenId) != _msgSender()
    ) revert InvalidCall();

    _registry[address(collection)][tokenId].name = name;
  }

  // ============ Admin Methods ============

  /**
   * @dev Allows admin to register any nft.
   */
  function register(
    IERC721 collection, 
    uint256 tokenId, 
    string memory name,
    string memory crew,
    string memory eyes,
    string memory head,
    string memory mask,
    string memory neck,
    string memory outerwear
  ) external onlyRole(_AUTHORIZE_ROLE) {
    //add to registry
    _registry[address(collection)][tokenId] = Metadata(
      name,
      crew,
      eyes,
      head,
      mask,
      neck,
      outerwear,
      true
    );
  }

  /**
   * Allows admin to remove a registry
   */
  function unregister(
    address collection, 
    uint256 tokenId
  ) external onlyRole(_AUTHORIZE_ROLE) {
    delete _registry[collection][tokenId];
  }
}