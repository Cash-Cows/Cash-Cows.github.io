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

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../IERC20Mintable.sol";
import "../IERC1155MintableSupply.sol";

// ============ Contract ============

/**
 * @dev A module that manages giveaways
 */
contract CashCowsGiveaway is AccessControl {
  // ============ Errors ============

  error InvalidCall();

  // ============ Constants ============

  bytes32 private constant _GIVEAWAY_ROLE = keccak256("GIVEAWAY_ROLE");

  // ============ Storage ============

  //mapping of proofs and if it's been used
  mapping(bytes => bool) private _redeemed;

  // ============ Read Methods ============

  /**
   * @dev Returns true if proof has been used
   */
  function redeemed(bytes memory proof) public view returns(bool) {
    return _redeemed[proof];
  }

  // ============ Write Methods ============

  /**
   * @dev Allows any to redeem a token with proof
   */
  function redeemToken(
    address token,
    address recipient,
    uint256 amount,
    uint256 nonce,
    bytes memory proof
  ) external {
    //revert if invalid proof
    if (redeemed(proof) || !hasRole(
      _GIVEAWAY_ROLE, 
      ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "redeem", 
            token,
            recipient,
            amount,
            nonce
          ))
        ),
        proof
      )
    )) revert InvalidCall();

    //go ahead and mint
    IERC20Mintable(token).mint(recipient, amount);
  }

  /**
   * @dev Allows any to redeem an item with proof
   */
  function redeemItem(
    address collection,
    address recipient,
    uint256 itemId,
    uint256 amount,
    uint256 nonce,
    bytes memory proof
  ) external {
    //revert if invalid proof
    if (redeemed(proof) || !hasRole(
      _GIVEAWAY_ROLE, 
      ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "redeem", 
            collection,
            recipient,
            itemId,
            amount,
            nonce
          ))
        ),
        proof
      )
    )) revert InvalidCall();

    //go ahead and mint
    IERC1155MintableSupply(collection).mint(
      recipient, 
      itemId, 
      amount, 
      ""
    );
  }
}