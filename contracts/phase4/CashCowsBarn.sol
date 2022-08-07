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
import "@openzeppelin/contracts/utils/Address.sol";

import "../IRegistry.sol";
import "../IERC20Mintable.sol";

// ============ Contract ============

/**
 * @dev This produces milk for CC and CCC
 */
contract CashCowsBarn is Ownable {
  using Address for address;

  // ============ Errors ============

  error InvalidCall();

  // ============ Constants ============

  uint256 public immutable START_TIME;

  // ============ Storage ============

  //the registry where all the metadata is stored
  IRegistry private _registry;
  //the token that will be issued
  IERC20Mintable private _token;
  //mapping of collection, crew and custom rates
  //eg. 0.00004629629 ether = 4 a day
  mapping(address => mapping(string => uint256)) private _rate;
  //mapping of collection, token id to how much was redeemed
  mapping(address => mapping(uint256 => uint256)) private _redeemed;
  

  // ============ Deploy ============

  /**
   * @dev Sets the start time to whenever this was deployed
   */
  constructor() {
    START_TIME = block.timestamp;
  }

  // ============ Read Methods ============

  /**
   * @dev Calculate how many a tokens an NFT earned
   */
  function releaseable(
    address collection, 
    uint256 tokenId
  ) public view returns(uint256) {
    //FORMULA: (now - when we first started) * rate
    uint256 totalEarned = ((block.timestamp - START_TIME) 
      //this is the rate for per crew, if not set then nothing is releaseable
      * _rate[collection][
        _registry.metadata(collection, tokenId).crew
      ]
    );

    //if the total earned is less than what was redeemed
    if (totalEarned < _redeemed[collection][tokenId]) {
      //prevent underflow error
      return 0;
    }
    //otherwise should be the total earned less what was already redeemed
    return totalEarned - _redeemed[collection][tokenId];
  }

  /**
   * @dev Releases tokens
   */
  function release(address collection, uint256[] memory tokenIds) external {
    //get the staker
    address staker = _msgSender();
    uint256 toRelease = 0;
    for (uint256 i = 0; i < tokenIds.length; i++) {
      //if not owner
      if (_registry.ownerOf(collection, tokenIds[i]) != staker) 
        revert InvalidCall();
      //get pending
      uint256 pending = releaseable(collection, tokenIds[i]);
      //add to what was already released
      _redeemed[collection][tokenIds[i]] += pending;
      //add to be released
      toRelease += pending;
    }
    //next mint tokens
    collection.functionCall(
      abi.encodeWithSelector(
        IERC20Mintable(collection).mint.selector, 
        staker, 
        toRelease
      ), 
      "Low-level mint failed"
    );
  }

  // ============ Admin Methods ============

  /**
   * @dev Sets the registry
   */
  function setRegistry(IRegistry registry) external onlyOwner {
    _registry = registry;
  }

  /**
   * @dev Sets the token we will be issuing out
   */
  function setToken(IERC20Mintable token) external onlyOwner {
    _token = token;
  }

  /**
   * @dev Sets the rate per collection and crew
   */
  function setRate(
    address collection, 
    string memory crew, 
    uint256 rate
  ) external onlyOwner {
    _rate[collection][crew] = rate;
  }
}