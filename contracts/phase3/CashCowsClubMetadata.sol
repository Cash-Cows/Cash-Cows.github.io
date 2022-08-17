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
import "@openzeppelin/contracts/utils/Strings.sol";

import "../IMetadata.sol";
import "../IRoyaltySplitter.sol";

// ============ Contract ============

/**
 * @dev Separated from the main contract to give
 * provisions to upgrade in the future
 */
contract CashCowsClubMetadata is Ownable, IMetadata {
  using Strings for uint256;

  // ============ Errors ============

  error InvalidCall();

  // ============ Storage ============

  //base URI
  string private _baseTokenURI;
  
  // ============ Read Methods ============

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  function tokenURI(
    uint256 tokenId
  ) external view returns(string memory) {
    //if no base URI
    if (bytes(_baseTokenURI).length == 0) revert InvalidCall();

    return string(
      abi.encodePacked(
        _baseTokenURI, 
        tokenId.toString(), 
        ".json"
      )
    );
  }
  
  // ============ Write Methods ============

  /**
   * @dev Setting base token uri would be acceptable if using IPFS CIDs
   */
  function setBaseURI(string memory uri) external onlyOwner {
    _baseTokenURI = uri;
  }
}