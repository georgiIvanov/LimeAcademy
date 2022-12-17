// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import './TokenCollection.sol';
import './ITokenCollection.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable {
  using Counters for Counters.Counter;

  event MarketFeeSet(uint percentage);
  event FeesWithdrawn(address to, uint amount);
  event CollectionAdded(string name, string symbol, address by);
  event SellOrderCreated(address collection, uint tokenId, uint price, address by);
  event SellOrderCancelled(address collection, uint tokenId, uint price, address by);
  event SellOrderExecuted(
    address collection, uint tokenId, uint price, address by,
    uint sellerReceivable, uint marketplaceReceivable
  );
  event BuyOrderCreated(address collection, uint tokenId, uint price, address by);
  event BuyOrderCancelled(address collection, uint tokenId, uint price, address by);
  event BuyOrderExecuted(
    address collection, uint tokenId, uint price, address by,
    uint sellerReceivable, uint marketplaceReceivable
  );

  // number between 0 and 1000
  uint16 public feePercentage;

  uint public lockedBalance;

  Counters.Counter private collectionCounter;

  // collectionId => ITokenCollection (token collection)
  mapping(uint => ITokenCollection) public collections;

  Counters.Counter private ordersCounter;

  // orderId => Order
  mapping(uint => Order) private orders;

  // collection => tokenId => orderId
  mapping(address => mapping(uint => uint)) private sellOrderIds;

  // collection => tokenId => buyer => orderId
  mapping(address => mapping(uint => mapping(address => uint))) private buyOrderIds;

  // Address (of token collection) => CollectionKey
  mapping(address => uint) private collectionKeys;

  constructor() {
    feePercentage = 30;
    lockedBalance = 0;
    collectionCounter.increment();
    ordersCounter.increment();
  }

  modifier collectionInMarketplace(address someAddress) {
    require(
      collectionKeys[someAddress] > 0,
      'Collection must be part of marketplace'
    );
    _;
  }

  function _requireMarketplaceApprover(
    IERC721 _collection, address _owner, uint _tokenId
  ) internal view {
    require(
      _collection.getApproved(_tokenId) == address(this)
      || _collection.isApprovedForAll(_owner, address(this)), 
    'Marketplace must be approver of token');
  }

  function setMarketFee(uint16 _newFeePercentage) onlyOwner public {
    require(_newFeePercentage >= 0 && _newFeePercentage <= 1000,
    'Fee must be between 0 and 1000');
    feePercentage = _newFeePercentage;
    emit MarketFeeSet(_newFeePercentage);
  }

  function withdraw(address _to, uint _amount) onlyOwner public {
    require(_amount <= balance(), 'Amount must be lte to balance');
    (bool sent, ) = address(_to).call{ value: _amount }('');
    require(sent, 'Failed to send ether to seller');
    emit FeesWithdrawn(_to, _amount);
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

    ITokenCollection collection = ITokenCollection(_collection);
    collections[collectionCounter.current()] = collection;
    collectionKeys[_collection] = collectionCounter.current();
    collectionCounter.increment();
    emit CollectionAdded(collection.name(), collection.symbol(), _msgSender());
  }

  function makeSellOrder(
    address _collection, uint _tokenId, uint _price
  ) collectionInMarketplace(_collection) public {
    IERC721 collection = IERC721(_collection);

    require(collection.ownerOf(_tokenId) == _msgSender(),
    'Seller must be owner of token');

    _requireMarketplaceApprover(collection, _msgSender(), _tokenId);

    require(_price > 0, 'Price for token must be above 0');

    require(sellOrderIds[_collection][_tokenId] == 0, 'A sell order already exists');

    Order memory order = orders[ordersCounter.current()];
    order.price = _price;
    order.createdBy = _msgSender();
    order.status = OrderStatus.open;
    order.tokenOwner = _msgSender();
    order.collection = _collection;
    order.token = _tokenId;
    order.ofType = OrderType.sell;
    orders[ordersCounter.current()] = order;
    sellOrderIds[_collection][_tokenId] = ordersCounter.current();
    ordersCounter.increment();
    emit SellOrderCreated(_collection, _tokenId, _price, _msgSender());
  }

  function cancelSellOrder(
    uint _orderId
  ) public {
    Order storage order = orders[_orderId];

    require(
      sellOrderIds[order.collection][order.token] > 0, 
      'Order doesn\'t exist'
    );
    require(order.status == OrderStatus.open, 'Order must have status open');
    require(order.tokenOwner == _msgSender(), 'Only original token owner can cancel order');

    order.status = OrderStatus.cancelled;
    delete sellOrderIds[order.collection][order.token];
    emit SellOrderCancelled(order.collection, order.token, order.price, _msgSender());
  }

  function executeSellOrder(uint _orderId, address _sendTo) public payable {
    Order storage order = orders[_orderId];
    IERC721 collection = IERC721(order.collection);

    require(
      sellOrderIds[order.collection][order.token] > 0, 
      'Order doesn\'t exist'
    );
    require(order.status == OrderStatus.open, 'Order must have status open');
    _requireMarketplaceApprover(collection, order.tokenOwner, order.token);
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
    delete sellOrderIds[order.collection][order.token];
    collection.safeTransferFrom(order.tokenOwner, _sendTo, order.token);
    emit SellOrderExecuted(
      order.collection, order.token, order.price, _msgSender(), amountReceivedBySeller, fee
    );
  }

  function makeBuyOrder(
    address _collection, uint _tokenId
  ) collectionInMarketplace(_collection) public payable {
    require(msg.value > 0, 'Buy bid for token must be above 0');
    require(buyOrderIds[_collection][_tokenId][_msgSender()] == 0,
    'Can\'t place buy order twice');
    IERC721 collection = IERC721(_collection);
    
    Order memory order = orders[ordersCounter.current()];
    order.price = msg.value;
    order.status = OrderStatus.open;
    order.createdBy = _msgSender();
    order.tokenOwner = collection.ownerOf(_tokenId);
    order.collection = _collection;
    order.token = _tokenId;
    order.ofType = OrderType.buy;
    orders[ordersCounter.current()] = order;
    buyOrderIds[_collection][_tokenId][_msgSender()] = ordersCounter.current();
    ordersCounter.increment();
    lockedBalance += msg.value;
    emit BuyOrderCreated(_collection, _tokenId, msg.value, _msgSender());
  }

  function cancelBuyOrder(uint _orderId) public {
    Order storage order = orders[_orderId];
    address buyer = _msgSender();
    require(
      buyOrderIds[order.collection][order.token][buyer] == _orderId,
      'Order doesn\'t exist or sender is not the creator'
    );

    delete buyOrderIds[order.collection][order.token][buyer];
    order.status = OrderStatus.cancelled;
    lockedBalance -= order.price;
    (bool sent, ) = buyer.call{ value: order.price }('');
    require(sent, 'Failed to return ether to buy order creator');
    emit BuyOrderCancelled(order.collection, order.token, order.price, buyer);
  }

  function executeBuyOrder(uint _orderId) public {
    Order storage order = orders[_orderId];
    address seller = _msgSender();

    require(order.price > 0, 'Order doesn\'t exist');
    require(order.status == OrderStatus.open, 'Order must have status open');
    require(order.tokenOwner == seller, 'Only token owner can execute buy order');

    IERC721 collection = IERC721(order.collection);
    require(collection.ownerOf(order.token) == seller, 'Seller must be token owner');
    _requireMarketplaceApprover(collection, seller, order.token);
    
    uint fee = calculateFeeFor(order.price);
    uint amountReceivedBySeller = order.price - fee;
    (bool sent, ) = seller.call{ value: amountReceivedBySeller }('');
    require(sent, 'Failed to send ether to seller');
    lockedBalance -= order.price;
    order.status = OrderStatus.executed;
    delete buyOrderIds[order.collection][order.token][order.createdBy];
    collection.safeTransferFrom(seller, order.createdBy, order.token);
    emit BuyOrderExecuted(
      order.collection, order.token, order.price, seller, amountReceivedBySeller, fee
    );
  }

  function collectionsCount() public view returns (uint) {
    return collectionCounter.current() - 1;
  }

  function ordersCount() public view returns (uint) {
    return ordersCounter.current() - 1;
  }

  function getCollection(uint _id) public view returns(ITokenCollection) {
    require(_id > 0 && _id <= collectionsCount(), 
    'Index must be: 0 < _id <= collectionsCount');
    return ITokenCollection(collections[_id]);
  }

  function getOrder(uint _id) public view returns (Order memory) {
    require(_id > 0 && _id <= ordersCount(), 
    'Index must be: 0 < _id <= ordersCount');
    return orders[_id];
  }

  function calculateFeeFor(uint amount) public view returns (uint) {
    return (amount * feePercentage / 1000);
  }

  function balance() public view returns (uint) {
    return address(this).balance - lockedBalance;
  }
}
