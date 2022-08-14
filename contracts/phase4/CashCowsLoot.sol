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
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../IRegistry.sol";
import "../IERC20Burnable.sol";
import "../ERC721Soulbound.sol";

// ============ Contract ============

/**
 * @dev ERC721; This is the loot store. You can get loot using 
 * ETH or any erc20 tokeb. Loot is soulbound to the NFT, and cannot be 
 * transferred, traded or burned.
 */
contract CashCowsLoot is 
  ERC721Soulbound, 
  Ownable, 
  AccessControl,
  Pausable, 
  ReentrancyGuard,
  IERC721Metadata
{
  // ============ Constants ============

  bytes32 public constant _FUNDER_ROLE = keccak256("FUNDER_ROLE");
  bytes32 public constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant _PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");
  
  // ============ Storage ============

  //mapping of loot id to uri
  mapping(uint256 => string) private _lootURI;
  //mapping of loot id to max supply
  mapping(uint256 => uint256) private _lootMax;
  //mapping of loot id to current supply
  mapping(uint256 => uint256) private _lootSupply;

  //the last loot id
  uint256 private _lastId;
  //mapping of token id to loot id
  mapping(uint256 => uint256) private _tokenLoot;
  //mapping of collection id to loot id to has
  mapping(uint256 => mapping(uint256 => bool)) private _collectionLoot;
  //checks to see if we should burn this or not
  mapping(address => bool) private _burnable;

  // ============ Deploy ============

  /**
   * @dev Sets the role admin
   */
  constructor(address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _setupRole(_PAUSER_ROLE, admin);
  }

  // ============ Read Methods ============

  /**
   * @dev Returns true if this collection has this loot
   */
  function exists(
    address collection, 
    uint256 token,
    uint256 lootId
  ) public view returns(bool) {
    return _collectionLoot[_packCollection(collection, token)][lootId];
  }

  /**
   * @dev Returns the max supply of `lootId`
   */
  function maxSupply(uint256 lootId) public view returns(uint256) {
    return _lootMax[lootId];
  }

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows Loot";
  }

  /**
   * @dev Returns last loot id
   */
  function lastLootId() external view returns(uint256) {
    return _lastId;
  }

  /**
   * @dev Returns the loot id of tokenId
   */
  function lootOf(uint256 tokenId) public view returns(uint256) {
    return _tokenLoot[tokenId];
  }

  /**
   * @dev Returns all the collection token loot ids
   */
  function loots(
    address collection, 
    uint256 token
  ) public view returns(uint256[] memory) {
    //get the collection id 
    uint256 collectionId = _packCollection(collection, token);
    //get the balance
    uint256 balance = _balanceOf(collectionId);
    //if no balance
    if (balance == 0) {
      //return empty array
      return new uint256[](0);
    }

    //this is how we can fix the array size
    uint256[] memory lootIds = new uint256[](balance);
    //next declare the array index
    uint256 index;
    //loop through the supply
    for (uint256 i = 1; i <= _lastId; i++) {
      //if collection has this loot
      if (_collectionLoot[collectionId][i]) {
        //add it to the token ids
        lootIds[index++] = i;
        //if the index is equal to the balance
        if (index == balance) {
          //break out to save time
          break;
        }
      }
    }
    //finally return the token ids
    return lootIds;
  }

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `lootId`.
   */
  function lootURI(uint256 lootId) public view returns(string memory) {
    string memory uri = _lootURI[lootId];
    if (bytes(uri).length == 0) revert InvalidCall();
    return uri;
  }

  /**
   * @dev Returns true if this contract implements  
   * the interface defined by `interfaceId`.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControl, ERC721Soulbound, IERC165) returns(bool) {
    return interfaceId == type(IERC721).interfaceId
      || super.supportsInterface(interfaceId);
  }

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external pure returns(string memory) {
    return "LOOT";
  }

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  function tokenURI(uint256 tokenId) external view returns(string memory) {
    //if token does not exist
    if (ownerOf(tokenId) == address(0)) revert InvalidCall();
    return lootURI(lootOf(tokenId));
  }

  /**
   * @dev Returns the overall amount of tokens generated for `lootId`
   */
  function totalSupply(uint256 lootId) public view returns(uint256) {
    return _lootSupply[lootId];
  }

  // ============ Mint Methods ============

  /**
   * @dev Allows anyone to mint for any NFT by purchasing with eth
   */
  function mint(
    address collection, 
    uint256 token,
    uint256 lootId,
    uint256 price,
    bytes memory proof
  ) external payable nonReentrant {
    if (//revert if invalid proof
      !hasRole(_MINTER_ROLE, ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "mint", 
            collection,
            token,
            lootId,
            address(0),
            price
          ))
        ),
        proof
      ))
      //or if there is no price or the amount sent is less than the price
      || price == 0 || msg.value < price
    ) revert InvalidCall();
    //we can go ahead and mint
    _safeMint(collection, token, lootId, "");
  }

  /**
   * @dev Allows anyone to mint for any NFT by purchasing with erc20 token
   */
  function mint(
    address collection, 
    uint256 token,
    uint256 lootId,
    address payment,
    uint256 price,
    bytes memory proof
  ) external nonReentrant {
    //revert if invalid proof
    if (!hasRole(_MINTER_ROLE, ECDSA.recover(
      ECDSA.toEthSignedMessageHash(
        keccak256(abi.encodePacked(
          "mint", 
          collection,
          token,
          lootId,
          payment,
          price
        ))
      ),
      proof
    ))) revert InvalidCall();
    //revert there is no price
    if (price == 0) revert InvalidCall();
    //if burnable
    if (_burnable[payment]) {
      //burn it. muhahaha
      //(the payer is the caller)
      IERC20Burnable(payment).burnFrom(_msgSender(), price);
    } else {
      //transfer it here
      //(the payer is the caller)
      //this will only pass if we have the allowance...
      IERC20(payment).transferFrom(_msgSender(), address(this), price);
    }
    //we can go ahead and mint
    _safeMint(collection, token, lootId, "");
  }
  
  // ============ Burn Methods ============

  /**
   * @dev Add loot burning to the mix
   */
  function burn(uint256 tokenId) external {
    //go ahead and burn
    _burn(tokenId);
  }
  
  // ============ Transfer Methods ============

  /**
   * @dev Allows anyone to safe transfer loot to current owner of 
   * the collection
   */
  function safeTransferFrom(
    address collection,
    uint256 token,
    uint256 tokenId
  ) external {
    safeTransferFrom(collection, token, tokenId, "");
  }

  /**
   * @dev Allows anyone to safe transfer loot to current owner of 
   * the collection
   */
  function safeTransferFrom(
    address collection,
    uint256 token,
    uint256 tokenId,
    bytes memory _data
  ) public {
    _safeTransfer(collection, token, tokenId, _data);
  }

  /**
   * @dev Allows anyone to transfer loot to current owner of 
   * the collection
   */
  function transferFrom(
    address collection,
    uint256 token,
    uint256 tokenId
  ) external {
    _transfer(collection, token, tokenId);
  }

  // ============ Admin Methods ============

  /**
   * @dev Adds loot for minting
   */
  function add(
    string memory uri, 
    uint256 max
  ) external onlyRole(_CURATOR_ROLE) {
    _lootURI[++_lastId] = uri;
    _lootMax[_lastId] = max;
  }
  
  /**
   * @dev Allows minter role to mint (this is good for integrations)
   */
  function mint(
    address collection, 
    uint256 token,
    uint256 lootId
  ) external onlyRole(_MINTER_ROLE) {
    //we can go ahead and mint
    _safeMint(collection, token, lootId, "");
  }

  /**
   * @dev Pauses all token transfers.
   */
  function pause() public virtual onlyRole(_PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Sets a token address that we will be burning when used on 
   * minting. This is like MILK or DOLLA
   */
  function burnTokens(
    IERC20 token, 
    bool burnable
  ) external onlyRole(_CURATOR_ROLE) {
    _burnable[address(token)] = burnable;
  }
  
  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() public virtual onlyRole(_PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev Updates loot URI
   */
  function updateURI(
    uint256 lootId, 
    string memory uri
  ) external onlyRole(_CURATOR_ROLE) {
    _lootURI[lootId] = uri;
  }

  /**
   * @dev Updates loot max supply
   */
  function updateMaxSupply(
    uint256 lootId, 
    uint256 max
  ) external onlyRole(_CURATOR_ROLE) {
    _lootMax[lootId] = max;
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
    address collection, 
    uint256 token,
    uint256 tokenId
  ) internal override {
    //revert if paused
    if (paused()) revert InvalidCall();
    super._beforeTokenTransfer(from, to, collection, token, tokenId);
  }

  /**
   * @dev Add loot burning to the mix
   */
  function _burn(uint256 tokenId) internal override {
    //get loot id
    uint256 lootId = lootOf(tokenId);
    //get collection id
    uint256 collectionId = collectionIdOf(tokenId);
    //we need the following checks to make sure supplies are accurate
    //also to prevent underflow
    //if no collection to loot
    if (!_collectionLoot[collectionId][lootId]
      //or no token to loot
    ) revert InvalidCall();
    //underflow check above
    unchecked {
      _lootSupply[lootOf(tokenId)]--;
    }
    delete _tokenLoot[tokenId];
    delete _collectionLoot[collectionId][tokenId];

    //go ahead and burn
    super._burn(tokenId);
  }

  /**
   * @dev Loot minting
   */
  function _safeMint(
    address collection, 
    uint256 token,
    uint256 lootId,
    bytes memory data
  ) internal {
    //revert if no URI
    if (bytes(_lootURI[lootId]).length == 0
      //or if collection token already has this loot
      || exists(collection, token, lootId)
      //or if max and supply passed max
      || (_lootMax[lootId] > 0 && (_lootSupply[lootId] + 1) > _lootMax[lootId])
    ) revert InvalidCall();

    //go ahead and mint
    super._safeMint(collection, token, data);

    uint256 tokenId = lastId();
    
    _lootSupply[lootId]++;
    _tokenLoot[tokenId] = lootId;
    _collectionLoot[collectionIdOf(tokenId)][tokenId] = true;
  }
}