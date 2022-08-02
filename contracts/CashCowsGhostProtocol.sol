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

import "./CashCowsAbstract.sol";

// ============ Interfaces ============

interface IBurnableBalance {
  function balanceOf(address owner) external view returns(uint256);
}

// ============ Contract ============

/**
 * @dev Specifics of the Cash Cows collection
 */
contract CashCowsGhostProtocol is ReentrancyGuard, CashCowsAbstract { 
  // ============ Constants ============

  //additional roles
  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  //max amount that can be minted in this collection
  uint16 public constant MAX_SUPPLY = 1000;

  // ============ Storage ============

  //mapping of address and how many minted
  mapping(address => uint256) public minted;
  //flag for if the mint is open to the public
  bool public mintOpened;
  //the sale price per token
  uint256 public mintPrice = 0.04 ether;

  IBurnableBalance private _burned;

  // ============ Deploy ============

  /**
   * @dev Sets the base token uri
   */
  constructor(
    string memory preview, 
    address admin
  ) CashCowsAbstract(preview, admin) {}
  
  // ============ Read Methods ============

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows: Ghost Protocol";
  }

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external pure returns(string memory) {
    return "MUU";
  }

  // ============ Write Methods ============

  /**
   * @dev Mints new tokens for the `recipient`. Its token ID will be 
   * automatically assigned
   */
  function mint(uint256 quantity) external payable nonReentrant {
    address recipient = _msgSender();
    //has the sale started?
    if (!mintOpened
      //or what is sent is less than what needs to be paid 
      || (quantity * mintPrice) > msg.value
      //the quantity being minted should not exceed the max supply
      || (super.totalSupply() + quantity) > MAX_SUPPLY
    ) revert InvalidCall();

    _safeMint(recipient, quantity);
  }

  /**
   * @dev Allows recipeints that redeem to mint tokens
   */
  function redeem(uint256 quantity) external {
    address recipient = _msgSender();
    uint256 maxMint = _burned.balanceOf(recipient) / 4;
    //revert if what was already minted is 
    //or more than the max possible mint
    if (minted[recipient] >= maxMint
      //of if what can be minted is less 
      //than the requested quantity 
      || (maxMint - minted[recipient]) < quantity
    ) revert InvalidCall();
    //okay to mint
    _safeMint(recipient, quantity);
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
    //the quantity being minted should not exceed the max supply
    if ((super.totalSupply() + quantity) > MAX_SUPPLY) 
      revert InvalidCall();

    _safeMint(recipient, quantity);
  }

  /**
   * @dev Starts the sale
   */
  function openMint(bool yes) external onlyRole(_CURATOR_ROLE) {
    mintOpened = yes;
  }

  /**
   * @dev Starts the sale
   */
  function setBurned(IBurnableBalance burned) external onlyRole(_CURATOR_ROLE) {
    _burned = burned;
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
}