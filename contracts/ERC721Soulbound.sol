// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// ============ Contract ============

/**
 * @dev ERC721; Makes NFTs soulbound to other NFTs
 */
contract ERC721Soulbound is Context, ERC165, IERC721 {
  // ============ Errors ============

  error InvalidCall();
  
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
  
  // ============ Storage ============

  // The last token id minted
  uint256 private _lastId;
  // Amount of tokens that have been burnt
  uint256 private _burned;

  // Mapping of token ID to address owner
  mapping(uint256 => address) private _owners;
  // Mapping of token ID to collection token id that owns this
  mapping(uint256 => uint256) private _collections;
  // Mapping of collection token to balance (this is used to iterate)
  mapping(uint256 => uint256) private _balances;

  // ============ Read Methods ============

  /**
   * @dev Returns the number of tokens in `owner`'s account.
   */
  function balanceOf(address owner) external view returns(uint256) {
    if (owner == address(0)) revert InvalidCall();
    uint256 balance;
    uint256 tokenId;
    do {//check owner for each
      if (_ownerOf(++tokenId) == owner) {
        balance++;
      }
    } while(tokenId <= _lastId);
    return balance;
  }

  /**
   * @dev Returns the number of tokens in `collection` `token`'s account.
   */
  function balanceOf(
    address collection, 
    uint256 token
  ) external view returns(uint256) {
    return _balanceOf(_packCollection(collection, token));
  }

  /**
   * @dev Returns the collection id.
   */
  function collectionIdOf(uint256 tokenId) public view returns(uint256) {
    return _collections[tokenId];
  }

  /**
   * @dev Returns the collection data with owner.
   */
  function collectionOf(uint256 tokenId) public view returns(
    address collection, 
    uint256 token
  ) {
    //unpack the collection and token
    (collection, token) = _unpackCollection(collectionIdOf(tokenId));
  }

  /**
   * @dev Returns the last ID minted
   */
  function lastId() public view returns(uint256) {
    return _lastId;
  }

  /**
   * @dev Returns the owner of the `tokenId` token.
   * This will revert if owner is zero address
   */
  function lastOwnerOf(uint256 tokenId) public view returns(address) {
    return _owners[tokenId];
  }

  /**
   * @dev Returns the owner of the `tokenId` token.
   * This will revert if owner is zero address
   */
  function ownerOf(uint256 tokenId) public view returns(address) {
    //get the collection and token
    (address collection, uint256 token) = collectionOf(tokenId);
    //ask the collection who is the owner of the token
    //if that reverts, so will this
    return IERC721(collection).ownerOf(token);
  }

  /**
   * @dev Returns true if this contract implements  
   * the interface defined by `interfaceId`.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC165, IERC165) returns(bool) {
    return interfaceId == type(IERC721).interfaceId
      || super.supportsInterface(interfaceId);
  }

  /**
   * @dev Shows the overall amount of tokens that were burnt
   */
  function totalBurned() external view returns(uint256) {
    return _burned;
  }

  /**
   * @dev Shows the overall amount of tokens generated in the contract
   */
  function totalSupply() external view returns(uint256) {
    return _lastId - _burned;
  }

  // ============ Disabled ERC721 Methods ============

  /**
   * @dev Approve disabled
   */
  function approve(address, uint256) external pure {
    revert InvalidCall();
  }

  /**
   * @dev Approve disabled
   */
  function getApproved(uint256) external pure returns(address) {
    revert InvalidCall();
  }

  /**
   * @dev Approve disabled
   */
  function isApprovedForAll(address, address) external pure returns(bool) {
    return false;
  }

  /**
   * @dev Approve disabled
   */
  function setApprovalForAll(address, bool) external pure {
    revert InvalidCall();
  }

  /**
   * @dev Disable user transfer
   */
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) external pure {
    safeTransferFrom(from, to, tokenId, "");
  }

  /**
   * @dev Disable user transfer
   */
  function safeTransferFrom(
    address,
    address,
    uint256,
    bytes memory
  ) public pure {
    revert InvalidCall();
  }

  /**
   * @dev Disable user transfer
   */
  function transferFrom(address, address, uint256) external pure {
    revert InvalidCall();
  }

  // ============ Transfer Methods ============

  /**
   * @dev Burns a token if the collection owner is also burned
   */
  function _burn(uint256 tokenId) internal virtual {
    //extract the collection data and owner
    (address collection, uint256 token) = collectionOf(tokenId);
    //revert if collection token exists
    if (_ownerOf(collection, token) != address(0)) revert InvalidCall();
    //get the current owner right now
    address owner = _owners[tokenId];
    //call hooks
    _beforeTokenTransfer(
      address(0), 
      owner, 
      collection, 
      token, 
      tokenId
    );
    //go ahead and burn it
    _burned++;
    _balances[_collections[tokenId]]--;
    delete _owners[tokenId];
    delete _collections[tokenId];

    emit Transfer(owner, address(0), tokenId);
  }

  /**
   * @dev Mints a token to the collection token
   */
  function _mint(
    address collection, 
    uint256 token
  ) internal {
    //get the owner of the collection token
    //this will revert if owner is zero address
    address owner = IERC721(collection).ownerOf(token);
    //call hooks
    _beforeTokenTransfer(
      address(0), 
      owner, 
      collection, 
      token, 
      ++_lastId
    );
    //set the owner
    _owners[_lastId] = owner;
    //map token id to collection
    _collections[_lastId] = _packCollection(collection, token);
    //add to the collection token balance
    _balances[_collections[_lastId]]++;
    //emit transfer
    emit Transfer(address(0), owner, _lastId);
  }

  /**
   * @dev Safely transfers `tokenId` to `collection` `token`
   */
  function _safeMint(
    address collection, 
    uint256 token,
    bytes memory _data
  ) internal {
    _mint(collection, token);
    if (Address.isContract(_owners[_lastId])
      && !_checkOnERC721Received(
        address(0), 
        _owners[_lastId], 
        _lastId, 
        _data
      )
    ) revert InvalidCall();
  }

  /**
   * @dev Internal function to invoke {IERC721Receiver-onERC721Received} 
   * on a target address. The call is not executed if the target address 
   * is not a contract.
   */
  function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) private returns (bool) {
    try IERC721Receiver(to).onERC721Received(
      _msgSender(), from, tokenId, _data
    ) returns (bytes4 retval) {
      return retval == IERC721Receiver.onERC721Received.selector;
    } catch (bytes memory reason) {
      if (reason.length == 0) {
        revert InvalidCall();
      } else {
        assembly {
          revert(add(32, reason), mload(reason))
        }
      }
    }
  }

  /**
   * @dev Safely transfers `tokenId` to `collection` `token`
   */
  function _safeTransfer(
    address collection, 
    uint256 token, 
    uint256 tokenId,
    bytes memory _data
  ) internal {
    (address from, address to) = _transfer(collection, token, tokenId);
    if (Address.isContract(to)
      && !_checkOnERC721Received(from, to, tokenId, _data)
    ) revert InvalidCall();
  }

  /**
   * @dev Transfers `tokenId` to `collection` `token`.
   */
  function _transfer(
    address collection, 
    uint256 token, 
    uint256 tokenId
  ) internal returns(address, address) {
    //get the owner of the collection token. this
    //should be who we are sending this token id to
    address to = _ownerOf(tokenId);
    //revert if collection token does not exists
    if (to == address(0)) revert InvalidCall();
    //get the current owner right now
    address from = _owners[tokenId];
    //call hooks
    _beforeTokenTransfer(
      from, 
      to, 
      collection, 
      token, 
      tokenId
    );
    //just set the new owner
    _owners[tokenId] = to;
    //emit transfer
    emit Transfer(from, to, tokenId);
    //return who we sent this to
    return (from, to);
  }

  // ============ Internal Methods ============

  /**
   * @dev Returns the number of tokens in `collection id`'s account.
   */
  function _balanceOf(uint256 collectionId) internal view returns(uint256) {
    return _balances[collectionId];
  }

  /**
   * @dev Returns the owner of the `collection` `token`.
   * This is a more softer approach and wont revert
   */
  function _ownerOf(
    address collection, 
    uint256 token
  ) internal view returns(address owner) {
    //ask the collection who is the owner of the token
    //if that reverts, so will this
    try IERC721(collection).ownerOf(token)
    returns(address collectionOwner) {
      owner = collectionOwner;
    } catch(bytes memory) {}
  }

  /**
   * @dev Returns the owner of the `tokenId` token.
   * This is a more softer approach and wont revert
   */
  function _ownerOf(
    uint256 tokenId
  ) internal view returns(address owner) {
    (address collection, uint256 token) = collectionOf(tokenId);
    return _ownerOf(collection, token);
  }

  // ============ Pack Methods ============

  /**
   * @dev Packs collection data into a single uint256.
   */
  function _packCollection(
    address collection, 
    uint256 tokenId
  ) internal pure returns(uint256 result) {
    uint256 ownerId;
    assembly {
      ownerId := and(collection, _BIT_COLLECTION_MASK)
    }

    result = (ownerId & _BIT_TOKEN_MASK) | (tokenId << _BIT_TOKEN_POSITION);
  }

  /**
   * @dev Unpacks collection data from uint256 `packed`
   */
  function _unpackCollection(
    uint256 packed
  ) internal pure returns(address collection, uint256 token) {
    return (
      _unpackCollectionAddress(packed),
      _unpackCollectionToken(packed)
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
  function _unpackCollectionToken(
    uint256 packed
  ) internal pure returns(uint256) {
    return (packed >> _BIT_TOKEN_POSITION) & _BIT_COLLECTION_MASK;
  }

  // ============ Placeholder Methods ============

  /**
   * @dev Hook that is called before any token transfer. This includes minting
   * and burning.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    address collection, 
    uint256 token,
    uint256 tokenId
  ) internal virtual {}
}