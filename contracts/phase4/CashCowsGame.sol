// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import "../IERC20Burnable.sol";

// ============ Interface ============

interface IERC1155Mintable is IERC1155, IERC1155Receiver {
  function mint(
    address to, 
    uint256 itemId, 
    uint256 amount,
    bytes memory data
  ) external;
}

// ============ Contract ============

contract CashCowsGame is Context, ReentrancyGuard, AccessControl {
  // ============ Errors ============

  error InvalidCall();

  // ============ Events ============

  event Attached(uint256 characterId, uint256 itemId, uint256 amount);
  event Detached(uint256 characterId, uint256 itemId, uint256 amount);

  // ============ Constants ============

  // Bits Layout:
  // - [0..159]   `address of collection`
  // - [160..] `tokenId`

  //length of token in packed data
  uint256 private constant _BIT_TOKEN_MASK = (1 << 192) - 1;
  //length of collection in packed data
  uint256 private constant _BIT_COLLECTION_MASK = (1 << 160) - 1;
  //position of token in packed data
  uint256 private constant _BIT_TOKEN_POSITION = 160;

  bytes32 private constant _FUNDER_ROLE = keccak256("FUNDER_ROLE");
  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 private constant _CURATOR_ROLE = keccak256("CURATOR_ROLE");
  
  // ============ Storage ============

  //mapping of item id -> character id -> balance
  mapping(uint256 => mapping(uint256 => uint256)) private _balances; 
  //checks to see if we should burn this or not
  mapping(address => bool) private _burnable;
  //flag that allows items to be detached
  bool private _canDetach;
  
  // ============ Deploy ============

  /**
   * @dev Sets the role admin
   */
  constructor(address admin) {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
  }
  
  // ============ Read Methods ============

  /**
   * @dev Returns of the `itemId` balance of the `characterId`
   */
  function balanceOf(
    uint256 characterId, 
    uint256 itemId
  ) external view returns(uint256) {
    return _balances[itemId][characterId];
  }

  // ============ Handler Methods ============

  /**
   * @dev Handles the receipt of a single ERC1155 token type. This 
   * function is called at the end of a `safeTransferFrom` after the 
   * balance has been updated.
   */
  function onERC1155Received(
    address,
    address,
    uint256,
    uint256,
    bytes calldata
  ) external pure returns(bytes4) {
    return 0xf23a6e61;
  }

  /**
   * @dev Handles the receipt of a multiple ERC1155 token types. This 
   * function is called at the end of a `safeBatchTransferFrom` after 
   * the balances have been updated.
   */
  function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
  ) external pure returns(bytes4) {
    return 0xbc197c81;
  }
  
  // ============ Write Methods ============

  /**
   * @dev Allows anyone to attach an `amount` of `itemId` they 
   * own to a `characterId`. This includes even gifting.
   */
  function attach(
    uint256 characterId, 
    uint256 itemId, 
    uint256 amount,
    bytes calldata data
  ) external {
    ( //get the item address and item token id
      address itemAddress, 
      uint256 itemTokenId
    ) = _unpackCollection(itemId);
    //try to transfer that item into the game
    IERC1155(itemAddress).safeTransferFrom(
      _msgSender(),
      address(this),
      itemTokenId,
      amount,
      data
    );
    //add to character item balance
    _balances[itemId][characterId] += amount;
    //emit attached
    emit Attached(characterId, itemId, amount);
  }

  /**
   * @dev Allows the owner of the `characterId` to detach an `amount` 
   * of `itemId` back to them.
   */
  function detach(
    uint256 characterId, 
    uint256 itemId, 
    uint256 amount,
    address to,
    bytes calldata data
  ) external {
    //revert if cant detach
    if (!_canDetach) revert InvalidCall();
    ( //get the character address and character id
      address characterAddress, 
      uint256 characterTokenId
    ) = _unpackCollection(itemId);
    _deatach(
      characterAddress, 
      characterTokenId, 
      characterId, 
      itemId, 
      amount, 
      to, 
      data
    );
  }

  /**
   * @dev Mints an `amount` of `itemId` for `characterId`   
   * from the `store` for `price` each, given `proof`
   */
  function mint(
    uint256 characterId, 
    IERC1155Mintable store,
    uint256 itemId,
    uint256 price,
    uint256 amount,
    bytes memory proof
  ) external payable {
    //revert if no price 
    if (price == 0 
      //or if the eth sent was less than the price
      || msg.value < (price * amount)
      //or invalid proof
      || !hasRole(_MINTER_ROLE, ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "mint", 
            address(store),
            characterId,
            itemId,
            price
          ))
        ),
        proof
      ))
    ) revert InvalidCall();
    
    _mint(characterId, store, itemId, amount);
  }

  /**
   * @dev Mints an `amount` of `itemId` for `characterId`   
   * from the `store` for `token` `price` each, given `proof`
   */
  function mint(
    uint256 characterId, 
    IERC1155Mintable store,
    uint256 itemId,
    address token,
    uint256 price,
    uint256 amount,
    bytes memory proof
  ) external {
    //revert if no price 
    if (price == 0 
      //or invalid proof
      || !hasRole(_MINTER_ROLE, ECDSA.recover(
        ECDSA.toEthSignedMessageHash(
          keccak256(abi.encodePacked(
            "mint", 
            address(store),
            characterId,
            itemId,
            token,
            price
          ))
        ),
        proof
      ))
    ) revert InvalidCall();

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
    
    _mint(characterId, store, itemId, amount);
  }
  
  // ============ Admin Methods ============

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
   * @dev Allows admin to `characterId` to detach an `amount` 
   * of `itemId` back to them.
   */
  function deatach(
    uint256 characterId, 
    uint256 itemId, 
    uint256 amount,
    bytes calldata data
  ) external onlyRole(_CURATOR_ROLE) {
    ( //get the character address and character id
      address characterAddress, 
      uint256 characterTokenId
    ) = _unpackCollection(itemId);
    //can only detach
    _deatach(
      characterAddress, 
      characterTokenId, 
      characterId, 
      itemId, 
      amount, 
      IERC721(characterAddress).ownerOf(characterTokenId), 
      data
    );
  }

  /**
   * @dev Allows/revokes the ability for items to be detached
   */
  function deatachable(bool yes) external onlyRole(_CURATOR_ROLE) {
    _canDetach = yes;
  }

  /**
   * @dev Allows admin to mint an `amount` of `itemId` for `characterId`   
   * from the `store` for `token` `price` each
   */
  function mint(
    uint256 characterId, 
    IERC1155Mintable store,
    uint256 itemId,
    uint256 amount
  ) external onlyRole(_MINTER_ROLE) {
    _mint(characterId, store, itemId, amount);
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
   * @dev Allows the owner of the `characterId` to detach an `amount` 
   * of `itemId` back to them.
   */
  function _deatach(
    address characterAddress, 
    uint256 characterTokenId,
    uint256 characterId, 
    uint256 itemId, 
    uint256 amount,
    address to,
    bytes calldata data
  ) internal {
    //revert if character item balance is less than the amount given
    if (_balances[itemId][characterId] < amount) revert InvalidCall();
    
    if (//revert if caller is not the owner of this character
      IERC721(characterAddress).ownerOf(characterTokenId) != _msgSender()
    ) revert InvalidCall();
    
    ( //get the item address and item token id
      address itemAddress, 
      uint256 itemTokenId
    ) = _unpackCollection(itemId);
    
    //try to transfer out to the intended recipient
    IERC1155(itemAddress).safeTransferFrom(
      address(this),
      to,
      itemTokenId,
      amount,
      data
    );

    unchecked { //less the balace
      _balances[itemId][characterId] -= amount;  
    }
    
    //emit attached
    emit Detached(characterId, itemId, amount);
  }

  /**
   * @dev Mints an `amount` of `itemId` for `characterId`   
   * from the `store` for `token` `price` each, given `proof`
   */
  function _mint(
    uint256 characterId, 
    IERC1155Mintable store,
    uint256 itemId,
    uint256 amount
  ) internal {
    //mint to this address
    store.mint(address(this), itemId, amount, "");
    //add to character item balance
    _balances[itemId][characterId] += amount;
  }
  
  // ============ Pack Methods ============

  /**
   * @dev Unpacks collection data from uint256 `packed`
   */
  function _unpackCollection(
    uint256 packed
  ) internal pure returns(address collection, uint256 tokenId) {
    return (
      _unpackCollectionAddress(packed),
      _unpackCollectionTokenId(packed)
    );
  }

  /**
   * @dev Unpacks collection address from uint256 `packed` collection data
   */
  function _unpackCollectionAddress(
    uint256 packed
  ) internal pure returns(address) {
    return address(uint160(packed & _BIT_COLLECTION_MASK));
  }

  /**
   * @dev Unpacks token id from uint256 `packed` collection data
   */
  function _unpackCollectionTokenId(
    uint256 packed
  ) internal pure returns(uint256) {
    return (packed >> _BIT_TOKEN_POSITION) & _BIT_COLLECTION_MASK;
  }
}