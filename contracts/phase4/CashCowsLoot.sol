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

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../IRegistry.sol";
import "../IERC20Burnable.sol";
import "../ERC721Soulbound.sol";

// ============ Contract ============

/**
 * @dev ERC721; This is the loot store. You can get loot with either 
 * $DOLLA or ETH. Loot is soulbound to the NFT, and cannot be 
 * transferred, traded or burned.
 */
contract CashCowsLoot is 
  ERC721Soulbound, 
  Ownable, 
  AccessControl,
  Pausable, 
  ReentrancyGuard 
{

  // ============ Structs ============

  struct TokenData {
    uint256 id;
    string uri;
    uint256 maxSupply;
    uint256 eth;
    uint256 dolla;
    bool active;
  }

  // ============ Constants ============

  bytes32 public constant _FUNDER_ROLE = keccak256("FUNDER_ROLE");
  bytes32 public constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant _PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");

  IERC20Burnable public immutable DOLLA;
  
  // ============ Storage ============

  //the last loot id
  uint256 private _lastLootId;
  //mapping of token id to loot id
  mapping(uint256 => uint256) private _tokens;
  //mapping of loot id to token data
  mapping(uint256 => TokenData) private _loot;
  
  //the registry where all the metadata is stored
  IRegistry private _registry;
  //mapping of token id to collection token id
  mapping(uint256 => mapping(address => uint256)) private _soulbound;

  // ============ Deploy ============

  /**
   * @dev Sets the base token uri
   */
  constructor(IERC20Burnable dolla, address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _setupRole(_PAUSER_ROLE, admin);
    DOLLA = dolla;
  }

  // ============ Read Methods ============

  /**
   * @dev Returns true if this contract implements  
   * the interface defined by `interfaceId`.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControl, ERC721Soulbound) returns(bool) {
    return interfaceId == type(IERC721).interfaceId
      || super.supportsInterface(interfaceId);
  }

  /**
   * @dev Returns last loot id
   */
  function lastLootId() external view returns(uint256) {
    return _lastLootId;
  }

  /**
   * @dev Returns the loot info of tokenId
   */
  function lootOf(uint256 tokenId) external view returns(TokenData memory) {
    uint256 lootId = _tokens[tokenId];
    //revert if no loot
    if (!_loot[lootId].active) revert InvalidCall();
    return _loot[lootId];
  }

  /**
   * @dev Returns loot info
   */
  function loot(uint256 lootId) external view returns(TokenData memory) {
    //revert if no loot
    if (!_loot[lootId].active) revert InvalidCall();
    return _loot[lootId];
  }

  // ============ Mint Methods ============

  /**
   * @dev Allows anyone to mint by purchasing with eth
   */
  function buy(
    address collection, 
    uint256 tokenId,
    uint256 lootId
  ) external payable nonReentrant {
    //revert there is no price 
    if (_loot[lootId].eth == 0 
      //or the amount sent is less than the price
      || msg.value < _loot[lootId].eth
    ) revert InvalidCall();

    _mint(
      collection, 
      tokenId, 
      lootId, 
      _registry.ownerOf(collection, tokenId), 
      ""
    );
  }

  /**
   * @dev Allows anyone to mint by purchasing with dolla
   */
  function mint(
    address collection, 
    uint256 tokenId,
    uint256 lootId
  ) external nonReentrant {
    //if there is a price and the amount sent is less than
    if(_loot[lootId].dolla == 0) revert InvalidCall();
    address owner = _registry.ownerOf(collection, tokenId);
    //burn it. muhahaha
    DOLLA.burnFrom(owner, _loot[lootId].dolla);
    //we are okay to mint
    _mint(collection, tokenId, lootId, owner, "");
  }

  // ============ Burn Methods ============

  /**
   * @dev Allows final owner to burn their token. Used to clean up a 
   * wallet after the main soulbounded toke was burnt
   */
  function burn(
    address collection,
    uint256 collectionTokenId,
    uint256 tokenId
  ) external {
    //revert if collection token id does not own this token id
    if (_soulbound[tokenId][collection] != collectionTokenId) 
      revert InvalidCall();
    //try to get the owner of the collection token
    try _registry.ownerOf(collection, collectionTokenId) 
    returns(address owner) {
      //revert if the owner is not address 0
      //this means that someone still owns this
      if (owner != address(0)) revert InvalidCall();
    } catch (bytes memory) {
      //it reverts because the token is burnt
      //this is what we want
    }

    delete _tokens[tokenId];
    delete _soulbound[tokenId][collection];
    _burn(tokenId);
  }

  // ============ Transfer Methods ============

  /**
   * @dev Allows safe collection transfer
   */
  function safeTransferFrom(
    address collection,
    uint256 collectionTokenId,
    uint256 tokenId
  ) external {
    safeTransferFrom(collection, collectionTokenId, tokenId, "");
  }

  /**
   * @dev Allows safe collection transfer
   */
  function safeTransferFrom(
    address collection,
    uint256 collectionTokenId,
    uint256 tokenId,
    bytes memory _data
  ) public {
    //revert if collection token id does not own this token id
    if (_soulbound[tokenId][collection] != collectionTokenId) 
      revert InvalidCall();
  
    address from = ownerOf(tokenId);
    address to = _registry.ownerOf(collection, collectionTokenId);
    _safeTransfer(from, to, tokenId, _data);
  }

  /**
   * @dev Allows collection transfer
   */
  function transferFrom(
    address collection,
    uint256 collectionTokenId,
    uint256 tokenId
  ) external {
    //revert if collection token id does not own this token id
    if (_soulbound[tokenId][collection] != collectionTokenId) 
      revert InvalidCall();

    address from = ownerOf(tokenId);
    address to = _registry.ownerOf(collection, collectionTokenId);
    _transfer(from, to, tokenId);
  }

  // ============ Admin Methods ============

  /**
   * @dev Adds loot for minting
   */
  function addLoot(
    string memory uri,
    uint256 maxSupply,
    uint256 eth,
    uint256 dolla
  ) external onlyRole(_CURATOR_ROLE) {
    _loot[++_lastLootId] = TokenData(
      _lastLootId, 
      uri, 
      maxSupply, 
      eth, 
      dolla, 
      true
    );
  }

  /**
   * @dev Allows admin to gift items (like for giveaways)
   */
  function airdrop(
    address collection, 
    uint256 tokenId,
    uint256 lootId
  ) external onlyRole(_MINTER_ROLE) {
    _mint(
      collection, 
      tokenId, 
      lootId, 
      _registry.ownerOf(collection, tokenId), 
      ""
    );
  }

  /**
   * @dev Pauses all token transfers.
   */
  function pause() public virtual onlyRole(_PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() public virtual onlyRole(_PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev Updates loot info
   */
  function updateLoot(
    uint256 lootId,
    string memory uri,
    uint256 maxSupply,
    uint256 eth,
    uint256 dolla
  ) external onlyRole(_CURATOR_ROLE) {
    _loot[lootId] = TokenData(lootId, uri, maxSupply, eth, dolla, true);
  }

  /**
   * @dev Sends the entire contract balance to a `recipient`. 
   */
  function withdraw(
    address recipient
  ) external nonReentrant onlyRole(_FUNDER_ROLE) {
    Address.sendValue(payable(recipient), address(this).balance);
  }

  /**
   * @dev This contract should not hold any tokens in the first place. 
   * This method exists to transfer out tokens funds.
   */
  function withdraw(
    IERC20 erc20, 
    address recipient, 
    uint256 amount
  ) external nonReentrant onlyRole(_FUNDER_ROLE) {
    SafeERC20.safeTransfer(erc20, recipient, amount);
  }

  // ============ Internal Methods ============

  /**
   * @dev Hook that is called before any token transfer. This includes minting
   * and burning.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override {
    //revert if paused
    if (paused()) revert InvalidCall();
    super._beforeTokenTransfer(from, to, tokenId);
  }

  /**
   * @dev Soulbound minting
   */
  function _mint(
    address collection, 
    uint256 tokenId,
    uint256 lootId,
    address owner,
    bytes memory data
  ) internal {
    //revert if there is no loot with this id
    if (!_loot[lootId].active) revert InvalidCall();
    //set loot, add soulbound, mint
    uint256 nextId = lastId() + 1;
    _tokens[nextId] = lootId;
    _soulbound[nextId][collection] = tokenId;
    //this will revert if no owner
    _safeMint(owner, data);
  }
}