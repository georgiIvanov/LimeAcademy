// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;
import '@openzeppelin/contracts/interfaces/IERC165.sol';

/**
 * Empty interface, used in tests.
 **/
interface EmptyInterface {
}

/**
 * Empty contract, used in tests.
 **/
contract EmptyIERC165 is IERC165, EmptyInterface {
  function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
    return interfaceId == type(EmptyInterface).interfaceId;
  }
}