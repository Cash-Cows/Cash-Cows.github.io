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

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import "erc721b/contracts/ERC721B.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./IMetadata.sol";

contract CashCows is 
  Ownable, 
  AccessControl, 
  ReentrancyGuard, 
  ERC721B, 
  IERC721Metadata 
{ 
  // ============ Constants ============

  //roles
  bytes32 private constant _DAO_ROLE = keccak256("DAO_ROLE");
  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 private constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");
  bytes32 private constant _APPROVED_ROLE = keccak256("APPROVED_ROLE");
  
  //bytes4(keccak256("royaltyInfo(uint256,uint256)")) == 0x2a55205a
  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
  
  //max amount that can be minted in this collection
  uint16 public constant MAX_SUPPLY = 7777;
  //the sale price per token
  uint256 public constant MINT_PRICE = 0.005 ether;

  //maximum amount that can be purchased per wallet in the public sale
  uint256 public constant MAX_PER_WALLET = 10;
  //maximum amount free per wallet in the public sale
  uint256 public constant MAX_FREE_PER_WALLET = 1;

  //contract URI
  string private _CONTRACT_URI;
  //immutable preview uri json
  string private _PREVIEW_URI;

  // ============ Storage ============

  //mapping of token id to who burned?
  mapping(uint256 => address) public burned;
  //mapping of address to amount minted
  mapping(address => uint256) public minted;
  //the splitter where your money at.
  address public royaltySplitter;
  //where 10000 == 100.00%
  uint256 public royaltyPercent = 1000;
  //flag for if the mint is open to the public
  bool public mintOpened;
  //count of how many burned
  uint256 private _totalBurned;
  //the location of the metadata generator
  IMetadata private _metadata;

  // ============ Deploy ============

  /**
   * @dev Sets the base token uri
   */
  constructor(string memory preview, address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _PREVIEW_URI = preview;
  }
  
  // ============ Read Methods ============

  /**
   * @dev Returns the contract URI.
   */
  function contractURI() external view returns(string memory) {
    return _CONTRACT_URI;
  }

  /**
   * @dev Override isApprovedForAll to whitelist marketplaces 
   * to enable gas-less listings.
   */
  function isApprovedForAll(
    address owner, 
    address operator
  ) public view override(ERC721B, IERC721) returns(bool) {
    return hasRole(_APPROVED_ROLE, operator) 
      || super.isApprovedForAll(owner, operator);
  }

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows";
  }

  /**
   * @dev See {IERC721-ownerOf}.
   */
  function ownerOf(
    uint256 tokenId
  ) public view override(ERC721B, IERC721) returns(address) {
    //error if burned
    if (burned[tokenId] != address(0)) revert NonExistentToken();
    return super.ownerOf(tokenId);
  }

  /**
   * @dev Returns all the owner's tokens. This is an incredibly 
   * ineffecient method and should not be used by other contracts.
   * It's recommended to call this on your dApp then call `ownsAll`
   * from your other contract instead.
   */
  function ownerTokens(
    address owner
  ) external view returns(uint256[] memory) {
    //get the balance
    uint256 balance = balanceOf(owner);
    //if no balance
    if (balance == 0) {
      //return empty array
      return new uint256[](0);
    }
    //this is how we can fix the array size
    uint256[] memory tokenIds = new uint256[](balance);
    //next get the total supply
    uint256 supply = totalSupply();
    //next declare the array index
    uint256 index;
    //loop through the supply
    for (uint256 i = 1; i <= supply; i++) {
      //if we found a token owner ows
      if (owner == ownerOf(i)) {
        //add it to the token ids
        tokenIds[index++] = i;
        //if the index is equal to the balance
        if (index == balance) {
          //break out to save time
          break;
        }
      }
    }
    //finally return the token ids
    return tokenIds;
  }

  /**
   * @dev Returns true if `owner` owns all the `tokenIds`
   */
  function ownsAll(
    address owner, 
    uint256[] memory tokenIds
  ) external view returns(bool) {
    for (uint256 i = 0; i < tokenIds.length; i++) {
      if (owner != ownerOf(tokenIds[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external pure returns(string memory) {
    return "MOO";
  }

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  function tokenURI(
    uint256 tokenId
  ) external view returns(string memory) {
    //if token does not exist
    if(!_exists(tokenId)) revert InvalidCall();
    //if metadata is not set
    if (address(_metadata) == address(0)) return _PREVIEW_URI;
    return _metadata.tokenURI(tokenId);
  }

  /**
   * @dev Shows the overall amount of tokens generated in the contract
   */
  function totalSupply() public view override returns(uint256) {
    return super.totalSupply() - _totalBurned;
  }

  // ============ Write Methods ============

  /**
   * @dev Burns `tokenId`. See {ERC721B-_burn}.
   *
   * Requirements:
   *
   * - The caller must own `tokenId` or be an approved operator.
   */
  function burn(uint256 tokenId) external {
    address owner = ERC721B.ownerOf(tokenId);
    if (!_isApprovedOrOwner(_msgSender(), tokenId, owner)) 
      revert InvalidCall();

    _beforeTokenTransfers(owner, address(0), tokenId, 1);
    
    // Clear approvals
    _approve(address(0), tokenId, owner);

    unchecked {
      //this is the situation when _owners are not normalized
      //get the next token id
      uint256 nextTokenId = tokenId + 1;
      //if token exists and yet it is address 0
      if (_exists(nextTokenId) && _owners[nextTokenId] == address(0)) {
        _owners[nextTokenId] = owner;
      }

      //this is the situation when _owners are normalized
      burned[tokenId] = owner;
      _balances[owner] -= 1;
      _owners[tokenId] = address(0);
      _totalBurned++;
    }

    _afterTokenTransfers(owner, address(0), tokenId, 1);

    emit Transfer(owner, address(0), tokenId);
  }

  /**
   * @dev Creates a new token for the `recipient`. Its token ID will be 
   * automatically assigned
   */
  function mint(uint256 quantity) external payable nonReentrant {
    address recipient = _msgSender();
    //no contracts sorry..
    if (recipient.code.length > 0
      //has the sale started?
      || !mintOpened
      //valid amount?
      || quantity == 0 
      //the quantity here plus the current amount already minted 
      //should be less than the max purchase amount
      || (quantity + minted[recipient]) > MAX_PER_WALLET
      //the quantity being minted should not exceed the max supply
      || (super.totalSupply() + quantity) > MAX_SUPPLY
    ) revert InvalidCall();

    //if there are still some free
    if (minted[recipient] < MAX_FREE_PER_WALLET) {
      //find out how much left is free
      uint256 freeLeft = MAX_FREE_PER_WALLET - minted[recipient];
      //if some of the quantity still needs to be paid
      if (freeLeft < quantity 
        // and what is sent is less than what needs to be paid 
        && ((quantity - freeLeft) * MINT_PRICE) > msg.value
      ) revert InvalidCall();
    //the value sent should be the price times quantity
    } else if ((quantity * MINT_PRICE) > msg.value) 
      revert InvalidCall();

    minted[recipient] += quantity;
    _safeMint(recipient, quantity);
  }

  /**
   * @dev Allows anyone to gemintt a token that was approved by the owner
   */
  function mint(
    uint256 quantity, 
    uint256 maxMint, 
    uint256 maxFree, 
    bytes memory proof
  ) external payable nonReentrant {
    address recipient = _msgSender();

    //valid amount?
    if (quantity == 0 
      //free cannot be more than max
      || maxMint < maxFree
      //the quantity here plus the current amount already minted 
      //should be less than the max purchase amount
      || (quantity + minted[recipient]) > maxMint
      //the quantity being minted should not exceed the max supply
      || (super.totalSupply() + quantity) > MAX_SUPPLY
      //make sure the minter signed this off
      || !hasRole(_MINTER_ROLE, ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "mint", 
            recipient, 
            maxMint,
            maxFree
          ))
        ),
        proof
      ))
    ) revert InvalidCall();

    //if there are still some free
    if (minted[recipient] < maxFree) {
      //find out how much left is free
      uint256 freeLeft = maxFree - minted[recipient];
      //if some of the quantity still needs to be paid
      if (freeLeft < quantity 
        // and what is sent is less than what needs to be paid 
        && ((quantity - freeLeft) * MINT_PRICE) > msg.value
      ) revert InvalidCall();
    //the value sent should be the price times quantity
    } else if ((quantity * MINT_PRICE) > msg.value) 
      revert InvalidCall();

    minted[recipient] += quantity;
    _safeMint(recipient, quantity);
  }

  /** 
   * @dev ERC165 bytes to add to interface array - set in parent contract
   *  implementing this standard
   */
  function royaltyInfo(
    uint256 _tokenId,
    uint256 _salePrice
  ) external view returns (
    address receiver,
    uint256 royaltyAmount
  ) {
    if (address(royaltySplitter) == address(0) || !_exists(_tokenId)) 
      revert InvalidCall();
    
    return (
      payable(royaltySplitter), 
      (_salePrice * royaltyPercent) / 10000
    );
  }

  // ============ Admin Methods ============

  /**
   * @dev Allows the _MINTER_ROLE to mint any to anyone (in the case of 
   * a no sell out)
   */
  function mint(
    address recipient,
    uint256 quantity
  ) external onlyRole(_MINTER_ROLE) nonReentrant {
    //make sure recipient is a valid address
    if (quantity == 0 
      //the quantity being minted should not exceed the max supply
      || (super.totalSupply() + quantity) > MAX_SUPPLY
    ) revert InvalidCall();

    _safeMint(recipient, quantity);
  }

  /**
   * @dev Sets the metadata location
   */
  function setMetadata(
    IMetadata metadata
  ) external onlyRole(_CURATOR_ROLE) {
    _metadata = metadata;
  }

  /**
   * @dev Sets the contract URI
   */
  function setURI(string memory uri) external onlyRole(_CURATOR_ROLE) {
    _CONTRACT_URI = uri;
  }

  /**
   * @dev Starts the sale
   */
  function openMint(bool yes) external onlyRole(_CURATOR_ROLE) {
    mintOpened = yes;
  }

  /**
   * @dev Updates the royalty (provisions for Cow DAO) 
   * where `percent` up to 1000 == 10.00%
   */
  function updateRoyalty(uint256 percent) external onlyRole(_DAO_ROLE) {
    if (percent > 1000) revert InvalidCall();
    royaltyPercent = percent;
  }

  /**
   * @dev Updates the treasury location, (in the case treasury needs to 
   * be updated)
   */
  function updateSplitter(address splitter) external onlyRole(_CURATOR_ROLE) {
    royaltySplitter = splitter;
  }
  
  /**
   * @dev Allows the proceeds to be withdrawn. This wont be allowed
   * until the metadata has been set to discourage rug pull
   */
  function withdraw(address recipient) external onlyOwner nonReentrant {
    //cannot withdraw without setting a base URI first
    if (address(_metadata) == address(0)) revert InvalidCall();
    payable(recipient).transfer(address(this).balance);
  }

  // ============ Internal Methods ============

  /**
   * @dev Returns whether `tokenId` exists.
   *
   * Tokens can be managed by their owner or approved accounts via 
   * {approve} or {setApprovalForAll}.
   *
   * Tokens start existing when they are minted (`_mint`),
   * and stop existing when they are burned (`_burn`).
   *
   * The parent defines `_exists` as greater than 0 and less than 
   * the last token id
   */
  function _exists(
    uint256 tokenId
  ) internal view virtual override returns(bool) {
    return burned[tokenId] == address(0) && super._exists(tokenId);
  }

  // ============ Linear Overrides ============

  /**
   * @dev Linear override for `supportsInterface` used by `AccessControl`
   *      and `ERC721B`
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControl, ERC721B, IERC165) returns(bool) {
    //support ERC721
    return interfaceId == type(IERC721Metadata).interfaceId
      //support ERC2981
      || interfaceId == _INTERFACE_ID_ERC2981
      //support other things
      || super.supportsInterface(interfaceId);
  }
}