// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';

import "hardhat/console.sol";

contract PayMe is Ownable {
  event PaymentReceived();
  event BatchPaymentReceived(uint[] itemIds, uint value);
  event PaymentForItemReceived(uint);
  event BalanceWithdrawn();
  event NonPaymentFunctionCalled();
  error PaymentAmountNotEnough(uint[] itemids, uint value);

  uint itemPrice;

  constructor() {
    // The cost of every item price, no matter its id, is 0.0001 ETH
    itemPrice = 100000000000000;
  }


  function nonPayment() public {
    emit NonPaymentFunctionCalled();
  }

  function simplePay() public payable {
    emit PaymentReceived();
  }

  function payFor(uint itemId) public payable {
    emit PaymentForItemReceived(itemId);
  }

  function batchPayment(uint[] calldata itemIds) public payable {
    if (itemIds.length * itemPrice > msg.value) {
      revert PaymentAmountNotEnough(itemIds, msg.value);
    }
    emit BatchPaymentReceived(itemIds, msg.value);
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