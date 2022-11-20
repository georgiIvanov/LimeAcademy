// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IMarketplace {

  event MarketplaceFeeReceived(address indexed fromCollection, address indexed fromSeller, uint amount);

  function receiveFee(address seller) external payable;
}