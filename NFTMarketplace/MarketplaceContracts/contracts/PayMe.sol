// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';

contract PayMe is Ownable {
  event PaymentReceived();
  event PaymentForItemReceived(uint);
  event BalanceWithdrawn();

  function simplePay() public payable {
    emit PaymentReceived();
  }

  function payFor(uint itemId) public payable {
    emit PaymentForItemReceived(itemId);
  }

  function withdraw() onlyOwner public {
    (bool sent, ) = address(_msgSender()).call{ value: balance() }('');
    require(sent, 'Failed to send ether to seller');
    emit BalanceWithdrawn();
  }

  function balance() public view returns (uint) {
    return address(this).balance;
  }
}