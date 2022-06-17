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

contract CashCows is 
  Ownable, 
  AccessControl, 
  ReentrancyGuard, 
  ERC721B, 
  IERC721Metadata 
{
  using Strings for uint256;
  
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
  //where 10000 == 100.00%
  uint256 public ROYALTY_FOR_ALL = 1000;

  //maximum amount that can be purchased per wallet in the public sale
  uint256 public constant MAX_PER_WALLET = 10;
  //maximum amount free per wallet in the public sale
  uint256 public constant MAX_FREE_PER_WALLET = 3;

  //immutable preview uri json
  string private _PREVIEW_URI;

  // ============ Storage ============

  //mapping of address to amount minted
  mapping(address => uint256) public minted;
  //flag for if the sales has started
  bool public saleStarted;
  //base URI
  string private _baseTokenURI;
  //the splitter where your money at.
  address public TREASURY;

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
   * @dev Override isApprovedForAll to whitelist marketplaces 
   * to enable gas-less listings.
   *
   * OS Rinkeby: 0xf57b2c51ded3a29e6891aba85459d600256cf317
   * OS Mainnet: 0xa5409ec958c83c3f309868babaca7c86dcb077c1
   */
  function isApprovedForAll(
    address owner, 
    address operator
  ) public view override(ERC721B, IERC721) returns(bool) {
    if (hasRole(_APPROVED_ROLE, operator)) {
      return true;
    }

    return super.isApprovedForAll(owner, operator);
  }

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows";
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
  function tokenURI(uint256 tokenId) external view returns(string memory) {
    if(!_exists(tokenId)) revert InvalidCall();
    return bytes(_baseTokenURI).length > 0 ? string(
      abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
    ) : _PREVIEW_URI;
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

  // ============ Write Methods ============

  /**
   * @dev Creates a new token for the `recipient`. Its token ID will be 
   * automatically assigned
   */
  function mint(uint256 quantity) external payable nonReentrant {
    address recipient = _msgSender();
    //no contracts sorry..
    if (recipient.code.length > 0
      //has the sale started?
      || !saleStarted
      //valid amount?
      || quantity == 0 
      //the quantity here plus the current amount already minted 
      //should be less than the max purchase amount
      || (quantity + minted[recipient]) > MAX_PER_WALLET
      //the quantity being minted should not exceed the max supply
      || (totalSupply() + quantity) > MAX_SUPPLY
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
      || (totalSupply() + quantity) > MAX_SUPPLY
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
    if (TREASURY == address(0) || !_exists(_tokenId)) 
      revert InvalidCall();
    
    return (
      payable(TREASURY), 
      (_salePrice * ROYALTY_FOR_ALL) / 10000
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
      || (totalSupply() + quantity) > MAX_SUPPLY
    ) revert InvalidCall();

    _safeMint(recipient, quantity);
  }

  /**
   * @dev Setting base token uri would be acceptable if using IPFS CIDs
   */
  function setBaseURI(string memory uri) external onlyRole(_CURATOR_ROLE) {
    _baseTokenURI = uri;
  }

  /**
   * @dev Starts the sale
   */
  function startSale(bool yes) external onlyRole(_CURATOR_ROLE) {
    saleStarted = yes;
  }

  /**
   * @dev Updates the royalty (provisions for Cow DAO) 
   * where `percent` up to 1000 == 10.00%
   */
  function updateRoyalty(uint256 percent) external onlyRole(_DAO_ROLE) {
    if (percent > 1000) revert InvalidCall();
    ROYALTY_FOR_ALL = percent;
  }

  /**
   * @dev Updates the treasury location, (in the case treasury needs to 
   * be updated)
   */
  function updateTreasury(address treasury) external onlyRole(_CURATOR_ROLE) {
    TREASURY = treasury;
  }
  
  /**
   * @dev Allows the proceeds to be withdrawn. This wont be allowed
   * until the collection is released to discourage rug pulls
   */
  function withdraw(address recipient) external onlyOwner nonReentrant {
    //cannot withdraw without setting a base URI first
    if (bytes(_baseTokenURI).length == 0) revert InvalidCall();
    payable(recipient).transfer(address(this).balance);
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