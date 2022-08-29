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

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../IRoyaltySplitter.sol";

// ============ Interfaces ============

interface IERC721BurableSupply is IERC721 {
  function burn(uint256 tokenId) external;
  function ownsAll(
    address owner, 
    uint256[] memory tokenIds
  ) external view returns(bool);
  function totalSupply() external view returns(uint256);
}

// ============ Contract ============

/**
 * @dev When you redeem ETH, you burn your Cash Cows Club membership
 */
contract CashCowsClubTreasury is Context, ReentrancyGuard, IRoyaltySplitter {
  // ============ Constants ============

  //we are going to need this to find out who owns what
  IERC721BurableSupply public immutable COLLECTION;

  // ============ Storage ============

  //total amount of ETH released
  uint256 private _ethTotalReleased;
  //total amount of ERC20 released
  mapping(IERC20 => uint256) private _erc20TotalReleased;
  //amount of ERC20 released per NFT token id
  mapping(IERC20 => mapping(uint256 => uint256)) private _erc20Released;

  // ============ Deploy ============

  constructor(IERC721BurableSupply collection) payable {
    //assign the collection
    COLLECTION = collection;
  }

  /**
   * @dev The Ether received will be logged with {PaymentReceived} 
   * events. Note that these events are not fully reliable: it's 
   * possible for a contract to receive Ether without triggering this 
   * function. This only affects the reliability of the events, and not 
   * the actual splitting of Ether.
   */
  receive() external payable virtual {
    emit PaymentReceived(_msgSender(), msg.value);
  }

  // ============ Read Methods ============

  /**
   * @dev Getter for the address of the payee via `tokenId`.
   */
  function payee(uint256 tokenId) public view returns(address) {
    return COLLECTION.ownerOf(tokenId);
  }

  /**
   * @dev Determines how much ETH are releaseable per nft
   */
  function releaseable(uint256) public view returns(uint256) {
    return _pendingPayment(
      address(this).balance, 
      _ethTotalReleased, 
      0
    );
  }

  /**
   * @dev Determines how much ERC20 `token` are releaseable for `tokenId`
   */
  function releaseable(
    IERC20 token, 
    uint256 tokenId
  ) public view returns(uint256) {
    return _pendingPayment(
      token.balanceOf(address(this)), 
      _erc20TotalReleased[token], 
      _erc20Released[token][tokenId]
    );
  }

  /**
   * @dev Returns the sum of ERC20 tokens releaseable given `tokenIds`
   */
  function releaseable(
    IERC20 token, 
    uint256[] memory tokenIds
  ) external view returns(uint256 totalReleaseable) {
    for(uint256 i = 0; i < tokenIds.length; i++) {
      //get payment and should be more than zero
      totalReleaseable += releaseable(token, tokenIds[i]);
    }
  }

  /**
   * @dev Getter for the amount of `token` tokens already released to a 
   * `tokenId`. `token` should be the address of an IERC20 contract.
   */
  function released(
    IERC20 token, 
    uint256 tokenId
  ) public view returns(uint256) {
    return _erc20Released[token][tokenId];
  }

  /**
   * @dev Getter for the amount of shares held by an account.
   */
  function shares() public view returns(uint256) {
    return COLLECTION.totalSupply();
  }

  /**
   * @dev Getter for the amount of shares held by an account.
   */
  function shares(address account) public view returns(uint256) {
    return COLLECTION.balanceOf(account);
  }

  /**
   * @dev Getter for the total amount of Ether already released.
   */
  function totalReleased() public view returns(uint256) {
    return _ethTotalReleased;
  }

  /**
   * @dev Getter for the total amount of `token` already released. 
   * `token` should be the address of an IERC20 contract.
   */
  function totalReleased(IERC20 token) public view returns(uint256) {
    return _erc20TotalReleased[token];
  }

  // ============ Write Methods ============

  /**
   * @dev Triggers a transfer to owner of `tokenId` of the amount of  
   * Ether they are owed.
   */
  function release(uint256 tokenId) external nonReentrant {
    //get account and should be the sender
    address account = payee(tokenId);
    if (account != _msgSender()) revert InvalidCall();
    //get payment and should be more than zero
    uint256 payment = releaseable(tokenId);
    if (payment == 0) revert InvalidCall();
    //add released payment
    _ethTotalReleased += payment;
    //burn it... muahhahaha
    //this contract needs permission to burn
    COLLECTION.burn(tokenId);
    //send it off.. buh bye!
    Address.sendValue(payable(account), payment);
    //let everyone know what happened
    emit PaymentReleased(account, payment);
  }

  /**
   * @dev Triggers a transfer to `account` of the amount of `token` 
   * tokens they are owed, according to their previous withdrawals. 
   * `token` must be the address of an IERC20 contract.
   */
  function release(
    IERC20 token, 
    uint256 tokenId
  ) external nonReentrant {
    //get account and should be the sender
    address account = payee(tokenId);
    if (account != _msgSender()) revert InvalidCall();
    //get payment and should be more than zero
    uint256 payment = releaseable(token, tokenId);
    if (payment == 0) revert InvalidCall();
    //add released payment
    _erc20Released[token][tokenId] += payment;
    _erc20TotalReleased[token] += payment;
    //send it off.. buh bye!
    SafeERC20.safeTransfer(token, payable(account), payment);
    //let everyone know what happened
    emit ERC20PaymentReleased(token, account, payment);
  }

  /**
   * @dev Triggers a transfer to owner of `tokenId` of the amount of  
   * Ether they are owed.
   */
  function releaseBatch(
    uint256[] memory tokenIds
  ) external nonReentrant {
    //get account and should be the sender
    address account = _msgSender();
    if (!COLLECTION.ownsAll(account, tokenIds)) revert InvalidCall();
    //get payment and should be more than zero
    uint256 payment = releaseable(1) * tokenIds.length;
    if (payment == 0) revert InvalidCall();
    //add released payment
    _ethTotalReleased += payment;
    //burn all of it... muahhahaha
    //this contract needs permission to burn
    for(uint256 i; i < tokenIds.length; i++) {
      COLLECTION.burn(tokenIds[i]);
    }
    //send it off.. buh bye!
    Address.sendValue(payable(account), payment);
    //let everyone know what happened
    emit PaymentReleased(account, payment);
  }

  /**
   * @dev Triggers a batch transfer to `account` of the amount of `token` 
   * tokens they are owed, according to their percentage of the total 
   * shares and their previous withdrawals. `token` must be the address 
   * of an IERC20 contract.
   */
  function releaseBatch(
    IERC20 token, 
    uint256[] memory tokenIds
  ) external nonReentrant {
    //get account and should be the owner
    address account = _msgSender();
    if (!COLLECTION.ownsAll(_msgSender(), tokenIds)) revert InvalidCall();
    
    uint256 payment;
    uint256 totalPayment;
    for(uint256 i = 0; i < tokenIds.length; i++) {
      //get payment and should be more than zero
      payment = releaseable(token, tokenIds[i]);
      //skip if noting is releaseable
      if (payment == 0) continue;
      //add released payment
      _erc20Released[token][tokenIds[i]] += payment;
      //add to total payment
      totalPayment += payment;
    }
    //if no payments are due
    if (totalPayment == 0) revert InvalidCall();
    //add released payment
    _erc20TotalReleased[token] += totalPayment;
    //send it off.. buh bye!
    SafeERC20.safeTransfer(token, payable(account), totalPayment);
    //let everyone know what happened
    emit ERC20PaymentReleased(token, account, payment);
  }

  // ============ Internal Methods ============

  /**
   * @dev internal logic for computing the pending payment of an 
   * `account` given the token historical balances and already 
   * released amounts.
   */
  function _pendingPayment(
    uint256 treasuryBalance,
    uint256 treasuryReleased,
    uint256 amountAlreadyReleased
  ) private view returns(uint256) {
    uint256 amount = (treasuryBalance + treasuryReleased) / shares();
    //it's possible that the amount is less than  
    //what is released because shares fluxiate
    if (amount < amountAlreadyReleased) return 0;
    return amount - amountAlreadyReleased;
  }
}