// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './TokenCollection.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable {

  // number between 0 and 1000
  uint16 public feePercentage = 30;

  uint private collectionCounter;

  // collectionId => IERC721Metadata (token collection)
  mapping(uint => IERC721Metadata) public collections;

  uint private ordersCounter;

  // orderId => Order
  mapping(uint => Order) private orders;

  // collection => tokenId => orderId
  mapping(address => mapping(uint => uint)) sellOrderIds;

  // Address (of token collection) => CollectionKey
  mapping(address => uint) private collectionKeys;

  constructor() {
    collectionCounter = 1;
    ordersCounter = 1;
  }

  modifier collectionInMarketplace(address someAddress) {
    require(
      collectionKeys[someAddress] > 0,
      'Collection must be part of marketplace'
    );
    _;
  }

  function setMarketFee(uint16 _newFeePercentage) onlyOwner public {
    require(_newFeePercentage >= 0 && _newFeePercentage <= 1000,
    'Fee must be between 0 and 1000');
    feePercentage = _newFeePercentage;
  }

  function withdraw(address _to, uint _amount) onlyOwner public {
    require(_amount <= balance(), 'Amount must be lte to balance');
    (bool sent, ) = address(_to).call{ value: _amount }('');
    require(sent, 'Failed to send ether to seller');
  }

  function createCollection(
      string calldata _name,
      string calldata _symbol,
      string calldata _description,
      string calldata _baseUri
  ) public {
      TokenCollection collection = new TokenCollection(
          _symbol,
          _baseUri,
          _name,
          _description
      );
      
      addCollection(address(collection));
  }

  function addCollection(address _collection) public {
    require(IERC165(_collection).supportsInterface(type(IERC721Metadata).interfaceId)
    && IERC165(_collection).supportsInterface(type(IERC721Enumerable).interfaceId),
      'Parameter must implement IERC721Metadata & IERC721Enumerable'
    );

    collections[collectionCounter] = IERC721Metadata(_collection);
    collectionKeys[_collection] = collectionCounter;
    collectionCounter++;
  }

  function makeSellOrder(
    address _collection, uint _tokenId, uint _price
  ) collectionInMarketplace(_collection) public {
    uint collectionKey = collectionKeys[_collection];
    require(collectionKey > 0, 'Collection must be part of marketplace');

    IERC721 collection = IERC721(_collection);

    require(collection.ownerOf(_tokenId) == _msgSender(),
    'Seller must be owner of token');

    require(
      collection.getApproved(_tokenId) == address(this)
      || collection.isApprovedForAll(_msgSender(), address(this)), 
    'Marketplace must be approver');

    require(_price > 0, 'Price for token must be above 0');

    require(sellOrderIds[_collection][_tokenId] == 0, 'A sell order already exists');

    Order memory order = orders[ordersCounter];
    order.price = _price;
    order.status = OrderStatus.open;
    order.tokenOwner = _msgSender();
    order.collection = _collection;
    order.token = _tokenId;
    order.ofType = OrderType.sell;
    orders[ordersCounter] = order;
    sellOrderIds[_collection][_tokenId] = ordersCounter;
    ordersCounter++;
    collection.transferFrom(_msgSender(), address(this), _tokenId);
  }

  function cancelSellOrder(
    uint _orderId
  ) public {
    Order storage order = orders[_orderId];

    require(
      sellOrderIds[order.collection][order.token] > 0, 
      'Order doesn\'t exist.'
    );
    require(order.status == OrderStatus.open, 'Order must have status open');
    require(order.tokenOwner == _msgSender(), 'Only original token owner can cancel order');

    IERC721 collection = IERC721(order.collection);

    require(collection.ownerOf(order.token) == address(this),
    'Marketplace must be owner of token.');
    
    order.status = OrderStatus.cancelled;
    sellOrderIds[order.collection][order.token] = 0;
    collection.transferFrom(address(this), _msgSender(), order.token);
  }

  function executeSellOrder(uint _orderId, address _sendTo) public payable {
    Order storage order = orders[_orderId];
    IERC721 collection = IERC721(order.collection);

    require(
      sellOrderIds[order.collection][order.token] > 0, 
      'Order doesn\'t exist.'
    );
    require(order.status == OrderStatus.open, 'Order must have status open');
    require(collection.ownerOf(order.token) == address(this),
    'Marketplace must be owner of token.');
    require(msg.value >= order.price, 'Not enought ether sent');

    uint fee = calculateFeeFor(order.price);
    uint amountReceivedBySeller = order.price - fee;
    uint amountReturned = msg.value - order.price;

    (bool sent, ) = order.tokenOwner.call{ value: amountReceivedBySeller }('');
    require(sent, 'Failed to send ether to seller');

    if(amountReturned > 0) {
      (sent, ) = _msgSender().call{ value: amountReturned }('');
      require(sent, 'Failed to return ether to buyer');
    }

    order.status = OrderStatus.executed;
    collection.safeTransferFrom(address(this), _sendTo, order.token);
  }

  function collectionsCount() public view returns (uint) {
    return collectionCounter - 1;
  }

  function ordersCount() public view returns (uint) {
    return ordersCounter - 1;
  }

  function getCollection(uint _index) public view returns(IERC721Metadata) {
    require(_index > 0 && _index <= collectionsCount(), 
    'Index must be: 0 < index <= collectionsCount');
    return IERC721Metadata(collections[_index]);
  }

  function getOrder(uint _index) public view returns (Order memory) {
    require(_index > 0 && _index <= ordersCount(), 
    'Index must be: 0 < index <= ordersCount');
    return orders[_index];
  }

  function calculateFeeFor(uint amount) public view returns (uint) {
    return (amount * feePercentage / 1000);
  }

  function balance() public view returns (uint) {
    return address(this).balance;
  }
}
