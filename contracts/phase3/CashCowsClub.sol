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

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./CashCowsClubAbstract.sol";

// ============ Interfaces ============

interface IRedeemable {
  function balanceOf(address owner) external view returns(uint256);
}

// ============ Contract ============

/**
 * @dev ERC721B; Cash Cows Club is the hard core version of Cash Cows
 */
contract CashCowsClub is ReentrancyGuard, CashCowsClubAbstract { 
  // ============ Constants ============

  //additional roles
  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  //max amount that can be minted in this collection
  uint16 public constant MAX_SUPPLY = 2000;
  uint16 public constant MAX_PUBLIC = 1000;

  // ============ Storage ============

  //mapping of address and how many minted
  mapping(address => uint256) public minted;
  //the sale price per token
  uint256 public mintPrice;
  //the sale price per token
  uint256 public maxMint;
  //flag for if the mint is open to the public
  bool public mintOpened;

  IRedeemable private _redeemable;
  uint256 private _redeemableExchange;

  // ============ Deploy ============

  /**
   * @dev Sets the base token uri
   */
  constructor(
    string memory preview, 
    address admin
  ) CashCowsClubAbstract(preview, admin) {}
  
  // ============ Read Methods ============

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows Club";
  }

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external pure returns(string memory) {
    return "MOOO";
  }

  // ============ Write Methods ============

  /**
   * @dev Mints new tokens for the `recipient`. Its token ID will be 
   * automatically assigned. What de/activates this is the maxMint and 
   * mintOpened
   */
  function mint(uint256 quantity) external payable nonReentrant {
    address recipient = _msgSender();
    //revert if contract
    if (Address.isContract(recipient) 
      //has the sale started?
      || !mintOpened
      //or what is sent is less than what needs to be paid 
      || (quantity * mintPrice) > msg.value
      //or what was already minted plus the quantity
      //is or more than the max possible mint
      || (minted[recipient] + quantity) > maxMint
      //the quantity being minted should not exceed the max public mint
      || (lastId() + quantity) > MAX_PUBLIC
    ) revert InvalidCall();
    //mark that they minted
    minted[recipient] += quantity;
    //okay to mint
    _safeMint(recipient, quantity);
  }

  /**
   * @dev Allows anyone to mint tokens that was approved by the owner
   * What de/activates this is the proof and maxMint
   */
  function mint(
    uint256 quantity, 
    bytes memory proof
  ) external payable nonReentrant {
    address recipient = _msgSender();

    //revert if contract
    if (Address.isContract(recipient) 
      //or what is sent is less than what needs to be paid 
      || (quantity * mintPrice) > msg.value
      //or what was already minted plus the quantity
      //is or more than the max possible mint
      || (minted[recipient] + quantity) > maxMint
      //or last id plus the quantity exceeds the max supply
      || (lastId() + quantity) > MAX_PUBLIC
      //make sure the minter signed this off
      || !hasRole(_MINTER_ROLE, ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked("mint", recipient))
        ),
        proof
      ))
    ) revert InvalidCall();
    //mark that they minted
    minted[recipient] += quantity;
    //okay to mint
    _safeMint(recipient, quantity);
  }

  /**
   * @dev Allows recipeints that redeem to mint tokens
   * What de/activates this is maxRedeem
   */
  function redeem(uint256 quantity) external {
    address recipient = _msgSender();
    uint256 maxRedeem = _redeemable.balanceOf(
      recipient
    ) / _redeemableExchange;
    //revert if what was already minted plus the quantity
    //is or more than the max possible redeem
    if((minted[recipient] + quantity) > maxRedeem
      //or the quantity being minted should not exceed the max supply
      || (lastId() + quantity) > MAX_SUPPLY
    ) revert InvalidCall();
    //mark that they minted
    minted[recipient] += quantity;
    //okay to mint
    _safeMint(recipient, quantity);
  }

  // ============ Admin Methods ============

  /**
   * @dev Starts the sale
   */
  function openMint(bool yes) external onlyRole(_CURATOR_ROLE) {
    mintOpened = yes;
  }

  /**
   * @dev Sets the max mint
   */
  function setMaxMint(uint256 max) external onlyRole(_CURATOR_ROLE) {
    maxMint = max;
  }

  /**
   * @dev Sets the mint price
   */
  function setMintPrice(uint256 price) external onlyRole(_CURATOR_ROLE) {
    mintPrice = price;
  }

  /**
   * @dev Starts the sale
   */
  function setRedeemable(
    IRedeemable redeemable, 
    uint256 exchange
  ) external onlyRole(_CURATOR_ROLE) {
    _redeemable = redeemable;
    _redeemableExchange = exchange;
  }

  /**
   * @dev Allows the proceeds to be withdrawn. This wont be allowed
   * until the metadata has been set to discourage rug pull
   */
  function withdraw(address recipient) external onlyOwner nonReentrant {
    //cannot withdraw without setting a base URI first
    if (address(_metadata) == address(0) 
      //treasury needs to be set
      || address(treasury) == address(0)
    ) revert InvalidCall();
    //first transfer to the treasury
    payable(address(treasury)).transfer(address(this).balance / 2);
    //then transfer the rest to the specified wallet
    payable(recipient).transfer(address(this).balance);
  }
}