// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

enum OrderStatus {
  open,
  executed,
  cancelled
}

enum OrderType {
  sell,
  buy
}

struct Order {
  uint price;
  address tokenOwner;
  address collection;
  uint token;
  OrderStatus status;
  OrderType ofType;
}
