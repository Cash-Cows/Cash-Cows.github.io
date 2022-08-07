// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts//utils/Context.sol";
import "@openzeppelin/contracts//utils/Strings.sol";
import "@openzeppelin/contracts//utils/introspection/ERC165.sol";

abstract contract AccessControl is Context, IAccessControl, ERC165 {
  // ============ Errors ============

  error InvalidCall();

  // ============ Constants ============

  bytes32 internal constant _ROLE_ADMIN = 0x00;

  // ============ Straoge ============
  
  //mapping of role to address to when they were assigned
  mapping(bytes32 => mapping(address => uint256)) private _roles;

  //activation period to when roles can be used
  uint256 private _roleActivation;

  // ============ Modifiers ============

  /**
   * @dev Modifier that checks that an account has a role. 
   */
  modifier onlyRole(bytes32 role) {
    if (!hasRole(role, _msgSender())) revert InvalidCall();
    _;
  }
  
  /**
   * @dev Modifier that checks that an account has an active role.
   */
  modifier onlyActiveRole(bytes32 role) {
    if (!hasActiveRole(role, _msgSender())) revert InvalidCall();
    _;
  }
  
  // ============ Read Methods ============

  /**
   * @dev Returns `true` if `account` has been granted `role`.
   */
  function hasRole(
    bytes32 role, 
    address account
  ) public view returns (bool) {
    return _roles[role][account] > 0;
  }

  /**
   * @dev Returns `true` if `account` has `role` and activated.
   */
  function hasActiveRole(
    bytes32 role, 
    address account
  ) public view returns (bool) {
    return block.timestamp > _roles[role][account];
  }

  /**
   * @dev suppoert for ERC165 interfaces.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return interfaceId == type(IAccessControl).interfaceId 
      || super.supportsInterface(interfaceId);
  }
  
  // ============ Write Methods ============

  /**
   * @dev Grants `role` to `account`.
   */
  function grantRole(
    bytes32 role, 
    address account
  ) public virtual override onlyActiveRole(_ROLE_ADMIN) {
    _grantRole(role, account, block.timestamp + _roleActivation);
  }

  /**
   * @dev Revokes `role` from `account`.
   */
  function revokeRole(
    bytes32 role, 
    address account
  ) public onlyActiveRole(_ROLE_ADMIN) {
    _revokeRole(role, account);
  }

  /**
   * @dev Revokes `role` from the calling account.
   */
  function renounceRole(
    bytes32 role, 
    address account
  ) public {
    if (_msgSender() != account) revert InvalidCall();
    _revokeRole(role, account);
  }

  /**
   * @dev Allows role admins to set the role activation time
   */
  function setActivationPeriod(
    uint256 active
  ) public onlyActiveRole(_ROLE_ADMIN) {
    _roleActivation = active;
  }
  
  // ============ Internal Methods ============

  /**
   * @dev Grants `role` to `account`. Need to use  
   * this method to setup role admin in constructor
   */
  function _grantRole(
    bytes32 role, 
    address account, 
    uint256 active
  ) internal {
    if (!hasRole(role, account)) {
      _roles[role][account] = active;
      emit RoleGranted(role, account, _msgSender());
    }
  }

  /**
   * @dev Revokes `role` from `account`.
   */
  function _revokeRole(bytes32 role, address account) internal {
    if (hasRole(role, account)) {
      _roles[role][account] = 0;
      emit RoleRevoked(role, account, _msgSender());
    }
  }
}
