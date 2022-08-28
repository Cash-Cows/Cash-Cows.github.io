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
  
  // ============ Storage ============

  //mapping of item id to uri
  mapping(uint256 => string) private _itemURI;
  //mapping of item id to max supply
  mapping(uint256 => uint256) private _itemMax;
  //mapping of item id to current supply
  mapping(uint256 => uint256) private _itemSupply;
  //mapping of item id to default price
  mapping(uint256 => uint256) private _itemETHPrice;
  //mapping of item id to default ERC20 price
  mapping(uint256 => mapping(IERC20 => uint256)) private _itemERC20Price;

  //the last item id
  uint256 private _lastItemId;
  //checks to see if we should burn this or not
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
   * @dev Returns the last item ID created
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
   * @dev Returns the ETH price of `itemId`
   */
  function priceOf(uint256 itemId) external view returns(uint256) {
    return _itemETHPrice[itemId];
  }

  /**
   * @dev Returns the ERC20 `token` price of `itemId`
   */
  function priceOf(
    uint256 itemId, 
    IERC20 token
  ) external view returns(uint256) {
    return _itemERC20Price[itemId][token];
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

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `itemId`.
   */
  function uri(
    uint256 itemId
  ) public view override returns(string memory) {
    string memory itemURI = _itemURI[itemId];
    return bytes(itemURI).length > 0 ? itemURI : super.uri(itemId);
  }

  // ============ Mint Methods ============

  /**
   * @dev Allows anyone to mint for anyone with eth
   */
  function mint(
    address to, 
    uint256 itemId,
    uint256 amount
  ) external payable nonReentrant {
    //revert if no price
    if (_itemETHPrice[itemId] == 0
      //or if the eth sent is less than price x amount
      || msg.value < (_itemETHPrice[itemId] * amount)
    ) revert InvalidCall();
    //we can go ahead and mint
    _mint(to, itemId, amount, "");
  }

  /**
   * @dev Allows anyone to batch mint for anyone with eth
   */
  function mint(
    address to, 
    uint256[] memory itemIds,
    uint256[] memory amounts
  ) external payable nonReentrant {
    //revert if length mismatch
    if (itemIds.length != amounts.length) revert InvalidCall();
    uint256 total;
    for (uint256 i; i < itemIds.length; i++) {
      //revert if no price
      if (_itemETHPrice[itemIds[i]] == 0) revert InvalidCall();
      total += _itemETHPrice[itemIds[i]] * amounts[i];
    }
    //if the eth sent is less than the total
    if (msg.value < total) revert InvalidCall();
    //we can go ahead and mint
    _mintBatch(to, itemIds, amounts, "");
  }

  /**
   * @dev Allows anyone to mint for anyone with erc20 token
   */
  function mint(
    address to, 
    uint256 itemId,
    address token,
    uint256 amount
  ) external nonReentrant {
    uint256 price = _itemERC20Price[itemId][IERC20(token)];
    //revert there is no price
    if (price == 0) revert InvalidCall();
    //if burnable
    if (_burnable[token]) {
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
  }

  /**
   * @dev Allows anyone to batch mint for anyone with erc20 token
   */
  function mint(
    address to, 
    uint256[] memory itemIds,
    address token,
    uint256[] memory amounts
  ) external nonReentrant {
    //revert if length mismatch
    if (itemIds.length != amounts.length) revert InvalidCall();
    uint256 total;
    IERC20 erc20Token = IERC20(token);
    for (uint256 i; i < itemIds.length; i++) {
      //revert if no price
      if (_itemERC20Price[itemIds[i]][erc20Token] == 0) revert InvalidCall();
      total += _itemERC20Price[itemIds[i]][erc20Token] * amounts[i];
    }

    //if burnable
    if (_burnable[token]) {
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
    string memory itemURI, 
    uint256 itemMax
  ) external onlyRole(_CURATOR_ROLE) {
    _itemURI[++_lastItemId] = itemURI;
    _itemMax[_lastItemId] = itemMax;
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
   * @dev Allows minter role to mint (this is good for integrations)
   */
  function mint(
    address to, 
    uint256 itemId, 
    uint256 amount,
    bytes memory data
  ) external onlyRole(_MINTER_ROLE) {
    //we can go ahead and mint
    _mint(to, itemId, amount, data);
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
   * @dev Sets the retail price
   */
  function setPrice(
    uint256 itemId, 
    uint256 price
  ) external onlyRole(_CURATOR_ROLE) {
    _itemETHPrice[itemId] = price;
  }

  /**
   * @dev Sets the retail price
   */
  function setPrice(
    uint256 itemId, 
    IERC20 token,
    uint256 price
  ) external onlyRole(_CURATOR_ROLE) {
    _itemERC20Price[itemId][token] = price;
  }

  /**
   * @dev Sets the default URI
   */
  function setPrice(string memory uri_) external onlyRole(_CURATOR_ROLE) {
    _setURI(uri_);
  }
  
  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() public virtual onlyRole(_PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev Updates item URI
   */
  function updateURI(
    uint256 itemId, 
    string memory itemURI
  ) external onlyRole(_CURATOR_ROLE) {
    _itemURI[itemId] = itemURI;
  }

  /**
   * @dev Updates item max supply
   */
  function updateMaxSupply(
    uint256 itemId, 
    uint256 itemMax
  ) external onlyRole(_CURATOR_ROLE) {
    _itemMax[itemId] = itemMax;
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

    //if minting
    if (from == address(0)) {
      uint256 index;
      uint256 itemId;
      uint256 amount;
      do {
        itemId = itemIds[index];
        amount = amounts[index];
        //revert if no item exists
        if (itemId > _lastItemId 
          //or if there is a max 
          || (_itemMax[itemId] > 0
            //and the current supply plus the amount exceeds the max 
            && (_itemSupply[itemId] + amount) > _itemMax[itemId]
          )
        ) revert InvalidCall();
        _itemSupply[itemId] += amount;
      } while(++index < itemIds.length);
    }

    super._beforeTokenTransfer(operator, from, to, itemIds, amounts, data);
  }
}