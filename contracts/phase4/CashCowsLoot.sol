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

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../IERC20Burnable.sol";

// ============ Contract ============

/**
 * @dev ERC721; This is the item store. You can get item using 
 * ETH or any erc20 tokeb. Loot is soulbound to the NFT, and cannot be 
 * transferred, traded or burned.
 */
contract CashCowsLoot is 
  ERC1155, 
  Ownable, 
  AccessControl,
  Pausable, 
  ReentrancyGuard
{
  // ============ Errors ============

  error InvalidCall();

  // ============ Constants ============

  bytes32 private constant _FUNDER_ROLE = keccak256("FUNDER_ROLE");
  bytes32 private constant _BURNER_ROLE = keccak256("BURNER_ROLE");
  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 private constant _PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 private constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");
  bytes32 private constant _APPROVED_ROLE = keccak256("APPROVED_ROLE");
  
  // ============ Storage ============

  //the last registered item
  uint256 private _lastItemId;
  //mapping of item id to max supply
  mapping(uint256 => uint256) private _itemMax;
  //mapping of item id to current supply
  mapping(uint256 => uint256) private _itemSupply;
  //mapping of item id to default price, zero add = eth
  mapping(uint256 => mapping(address => uint256)) private _itemPrice;
  //mapping of burnable tokens
  mapping(address => bool) private _burnable;

  // ============ Deploy ============

  /**
   * @dev Sets the role admin
   */
  constructor(string memory _uri, address admin) ERC1155(_uri) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
    _setupRole(_PAUSER_ROLE, admin);
  }

  // ============ Read Methods ============

  /**
   * @dev Override isApprovedForAll to whitelist marketplaces 
   * to enable gas-less listings.
   */
  function isApprovedForAll(
    address owner, 
    address operator
  ) public view override returns(bool) {
    return hasRole(_APPROVED_ROLE, operator) 
      || super.isApprovedForAll(owner, operator);
  }

  /**
   * @dev Returns a summary info of the `itemId`
   */
  function infoOf(
    uint256 itemId, 
    address[] memory tokens
  ) external view returns(uint256 supply, uint256 max, uint256[] memory prices) {
    supply = _itemSupply[itemId];
    max = _itemMax[itemId];
    prices = new uint256[](tokens.length);
    for (uint256 i; i < tokens.length; i++) {
      prices[i] = _itemPrice[itemId][tokens[i]];
    }
  }

  /**
   * @dev Returns the last item id made
   */
  function lastItemId() external view returns(uint256) {
    return _lastItemId;
  }

  /**
   * @dev Returns the max supply of `itemId`
   */
  function maxSupply(uint256 itemId) external view returns(uint256) {
    return _itemMax[itemId];
  }

  /**
   * @dev Returns the token collection name.
   */
  function name() external pure returns(string memory) {
    return "Cash Cows Loot";
  }

  /**
   * @dev Returns the eth price of `itemId`
   */
  function priceOf(
    uint256 itemId
  ) external view returns(uint256) {
    return priceOf(itemId, address(0));
  }

  /**
   * @dev Returns the ERC20 `token` price of `itemId`
   */
  function priceOf(
    uint256 itemId, 
    address token
  ) public view returns(uint256) {
    return _itemPrice[itemId][token];
  }

  /**
   * @dev Returns true if this contract implements the interface 
   * defined by `interfaceId`.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControl, ERC1155) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  /**
   * @dev Returns the token collection symbol.
   */
  function symbol() external pure returns(string memory) {
    return "LOOT";
  }

  /**
   * @dev Returns the overall amount of tokens generated for `itemId`
   */
  function totalSupply(uint256 itemId) external view returns(uint256) {
    return _itemSupply[itemId];
  }

  // ============ Mint Methods ============

  /**
   * @dev Allows anyone to mint for anyone with erc20 token
   */
  function mint(
    address token,
    address to, 
    uint256 itemId,
    uint256 amount
  ) external payable nonReentrant {
    //revert if we cant mint
    if (!_canMint(itemId, amount)) revert InvalidCall();
    //get the price
    uint256 price = _itemPrice[itemId][token];
    //revert there is no price
    if (price == 0) revert InvalidCall();
    //if zero add (it's eth)
    if (token == address(0)) {
      //revert if the eth sent is less than price x amount
      if (msg.value < (price * amount)) revert InvalidCall();
    //if burnable
    } else if (_burnable[token]) {
      //burn it. muhahaha
      //(the payer is the caller)
      IERC20Burnable(token).burnFrom(_msgSender(), price * amount);
    } else {
      //transfer it here
      //(the payer is the caller)
      //this will only pass if we have the allowance...
      IERC20(token).transferFrom(
        _msgSender(), 
        address(this), 
        price * amount
      );
    }

    //we can go ahead and mint
    _mint(to, itemId, amount, "");
    _itemSupply[itemId] += amount;
  }

  /**
   * @dev Allows anyone to batch mint for anyone with erc20 token
   */
  function mint(
    address token,
    address to, 
    uint256[] memory itemIds,
    uint256[] memory amounts
  ) public payable nonReentrant {
    //revert if length mismatch
    if (itemIds.length != amounts.length) revert InvalidCall();
    uint256 total;
    for (uint256 i; i < itemIds.length; i++) {
      //revert if no price
      if (_itemPrice[itemIds[i]][token] == 0
        //or cant mint
        || !_canMint(itemIds[i], amounts[i])
      ) revert InvalidCall();
      total += _itemPrice[itemIds[i]][token] * amounts[i];
      _itemSupply[itemIds[i]] += amounts[i];
    }

    //if zero add (it's eth)
    if (token == address(0)) {
      //revert if the eth sent is less than total
      if (msg.value < total) revert InvalidCall();
    //if burnable
    } else if (_burnable[token]) {
      //burn it. muhahaha
      //(the payer is the caller)
      IERC20Burnable(token).burnFrom(_msgSender(), total);
    } else {
      //transfer it here
      //(the payer is the caller)
      //this will only pass if we have the allowance...
      IERC20(token).transferFrom(
        _msgSender(), 
        address(this), 
        total
      );
    }

    //we can go ahead and mint
    _mintBatch(to, itemIds, amounts, "");
  }

  // ============ Burn Methods ============

  /**
   * @dev Allows owner, burner or approved to burn
   */
  function burn(
    address account,
    uint256 itemId,
    uint256 value
  ) public virtual {
    address operator = _msgSender();
    //revert if caller is not account
    if(account != operator
      //and caller is not a burner
      && !hasRole(_BURNER_ROLE, operator)
      //and caller is not approved
      && !isApprovedForAll(account, operator)
    ) revert InvalidCall();

    _burn(account, itemId, value);
  }

  /**
   * @dev Allows owner, burner or approved to burn
   */
  function burn(
    address account,
    uint256[] memory ids,
    uint256[] memory values
  ) public virtual {
    address operator = _msgSender();
    //revert if caller is not account
    if(account != operator
      //and caller is not a burner
      && !hasRole(_BURNER_ROLE, operator)
      //and caller is not approved
      && !isApprovedForAll(account, operator)
    ) revert InvalidCall();

    _burnBatch(account, ids, values);
  }

  // ============ Admin Methods ============

  /**
   * @dev Adds item for minting
   */
  function addItem(
    uint256 itemMax,
    address[] memory tokens,
    uint256[] memory prices
  ) external onlyRole(_CURATOR_ROLE) {
    if (tokens.length != prices.length) revert InvalidCall();
    _itemMax[++_lastItemId] = itemMax;
    for (uint256 i; i < tokens.length; i++) {
      _itemPrice[_lastItemId][tokens[i]] = prices[i];
    }
  }

  /**
   * @dev Sets a token address that we will be burning when used on 
   * minting. This is like MILK or DOLLA
   */
  function burnTokens(
    IERC20Burnable token, 
    bool burnable
  ) external onlyRole(_CURATOR_ROLE) {
    _burnable[address(token)] = burnable;
  }
  
  /**
   * @dev Allows minter role to mint (this is good for integrations)
   */
  function mint(
    address to, 
    uint256 itemId, 
    uint256 amount,
    bytes memory data
  ) external onlyRole(_MINTER_ROLE) {
    //revert if cant mint
    if (!_canMint(itemId, amount)) revert InvalidCall();
    //we can go ahead and mint
    _mint(to, itemId, amount, data);
    _itemSupply[itemId] += amount;
  }

  /**
   * @dev Allows minter role to mint (this is good for integrations)
   */
  function mint(
    address to, 
    uint256[] memory itemIds, 
    uint256[] memory amounts,
    bytes memory data
  ) external onlyRole(_MINTER_ROLE) {
    for (uint256 i; i < itemIds.length; i++) {
      //revert if cant mint
      if (!_canMint(itemIds[i], amounts[i])) revert InvalidCall();
      _itemSupply[itemIds[i]] += amounts[i];
    }
    //we can go ahead and mint
    _mintBatch(to, itemIds, amounts, data);
  }

  /**
   * @dev Pauses all token transfers.
   */
  function pause() public virtual onlyRole(_PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Sets the default URI
   */
  function setURI(string memory uri_) external onlyRole(_CURATOR_ROLE) {
    _setURI(uri_);
  }
  
  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() public virtual onlyRole(_PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev Updates item max supply
   */
  function updateMaxSupplies(
    uint256[] memory itemIds,
    uint256[] memory itemMaxs
  ) external onlyRole(_CURATOR_ROLE) {
    if (itemIds.length != itemMaxs.length) revert InvalidCall();
    for (uint256 i; i < itemIds.length; i++) {
      if (itemIds[i] > _lastItemId) revert InvalidCall();
      _itemMax[itemIds[i]] = itemMaxs[i];
    }
  }

  /**
   * @dev Sets the retail `token` `prices` of an `itemId`
   */
  function updatePrices(
    uint256 itemId, 
    address[] memory tokens,
    uint256[] memory prices
  ) external onlyRole(_CURATOR_ROLE) {
    if (itemId > _lastItemId 
      || tokens.length != prices.length
    ) revert InvalidCall();
    for (uint256 i; i < tokens.length; i++) {
      _itemPrice[itemId][tokens[i]] = prices[i];
    }
  }

  /**
   * @dev Sets the retail `token` `prices` of multiple `itemIds`
   */
  function updatePrices(
    uint256[] memory itemIds, 
    address token,
    uint256[] memory prices
  ) external onlyRole(_CURATOR_ROLE) {
    if (itemIds.length != prices.length) revert InvalidCall();
    for (uint256 i; i < itemIds.length; i++) {
      if (itemIds[i] > _lastItemId) revert InvalidCall();
      _itemPrice[itemIds[i]][token] = prices[i];
    }
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
   * @dev Sends the `amount` token out to a `recipient`.
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
   * @dev Returns true if the amount exceeds the max limit
   */
  function _canMint(
    uint256 itemId, 
    uint256 amount
  ) private view returns(bool) {
    return itemId <= _lastItemId
      && (_itemMax[itemId] == 0 
        || (_itemSupply[itemId] + amount) <= _itemMax[itemId]
      );
  }

  /**
   * @dev Hook that is called before any token transfer. This includes minting
   * and burning.
   */
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory itemIds,
    uint256[] memory amounts,
    bytes memory data
  ) internal override {
    //revert if paused
    if (paused()) revert InvalidCall();
    super._beforeTokenTransfer(operator, from, to, itemIds, amounts, data);
  }
}