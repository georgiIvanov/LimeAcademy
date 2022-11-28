// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';

interface IMarketplace is IERC165 {

  event MarketplaceFeeReceived(address indexed fromCollection, address indexed fromSeller, uint amount);

  function receiveFee(address seller) external payable;
}