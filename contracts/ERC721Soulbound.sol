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

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// ============ Contract ============

/**
 * @dev ERC721 Soulbound version
 */
contract ERC721Soulbound is Context, ERC165, IERC721 {
  // ============ Errors ============

  error InvalidCall();
  
  // ============ Storage ============

  // The last token id minted
  uint256 private _lastTokenId;
  // Amount of tokens that have been burnt
  uint256 private _burned;

  // Mapping from token ID to owner address
  mapping(uint256 => address) private _owners;
  // Mapping owner address to token count
  mapping(address => uint256) private _balances;

  // ============ Read Methods ============

  /**
   * @dev Returns the number of tokens in `owner`'s account.
   */
  function balanceOf(
    address owner
  ) external view returns(uint256) {
    if (owner == address(0)) revert InvalidCall();
    return _balances[owner];
  }

  /**
   * @dev Returns the last ID minted
   */
  function lastId() public view returns(uint256) {
    return _lastTokenId;
  }

  /**
   * @dev Returns the owner of the `tokenId` token.
   */
  function ownerOf(
    uint256 tokenId
  ) public view returns(address) {
    address owner = _owners[tokenId];
    if(owner == address(0)) revert InvalidCall();
    return owner;
  }

  /**
   * @dev Returns true if this contract implements  
   * the interface defined by `interfaceId`.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC165, IERC165) returns(bool) {
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
    return _lastTokenId - _burned;
  }

  // ============ Approval Methods ============

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

  // ============ Mint Methods ============

  /**
   * @dev Safely mints `tokenId` and transfers it to `to`.
   */
  function _safeMint(address to) internal virtual {
    _safeMint(to, "");
  }

  /**
   * @dev Safely mints `tokenId` and transfers it to `to`.
   */
  function _safeMint(address to, bytes memory _data) internal {
    _mint(to);
    if (Address.isContract(to)
      && !_checkOnERC721Received(address(0), to, _lastTokenId, _data)
    ) revert InvalidCall();
  }

  /**
   * @dev Mints `to`.
   */
  function _mint(address to) internal {
    //add a hook
    _beforeTokenTransfer(address(0), to, ++_lastTokenId);
    //revert if mint to the zero address
    if (to == address(0)) revert InvalidCall();

    _balances[to] += 1;
    _owners[_lastTokenId] = to;

    emit Transfer(address(0), to, _lastTokenId);
  }

  // ============ Burn Methods ============

  /**
   * @dev You can burn a soulbound token
   */
  function _burn(uint256 tokenId) public {
    //get the owner
    address from = _owners[tokenId];
    //add a hook
    _beforeTokenTransfer(from, address(0), tokenId);

    _burned++;
    _balances[from] -= 1;
    delete _owners[tokenId];

    emit Transfer(from, address(0), tokenId);
  }

  // ============ Transfer Methods ============

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
   * @dev Safely transfers `tokenId` token from `from` to `to`, checking 
   * first that contract recipients are aware of the ERC721 protocol to 
   * prevent tokens from being forever locked.
   */
  function _safeTransfer(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) internal {
    _transfer(from, to, tokenId);
    if (Address.isContract(to)
      && !_checkOnERC721Received(from, to, tokenId, _data)
    ) revert InvalidCall();
  }

  /**
   * @dev Transfers `tokenId` from `from` to `to`.
   */
  function _transfer(address from, address to, uint256 tokenId) internal {
    //add a hook
    _beforeTokenTransfer(from, to, tokenId);

    unchecked {
      _balances[to] += 1;
      _balances[from] -= 1;
      _owners[tokenId] = to;
    }

    emit Transfer(from, to, tokenId);
  }

  /**
   * @dev Hook that is called before any token transfer. This includes minting
   * and burning.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {}
}