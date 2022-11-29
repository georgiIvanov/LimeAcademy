// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './TokenCollection.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable {
    uint private collectionCounter;

    // collectionId => IERC721Metadata (token collection)
    mapping(uint => IERC721Metadata) public collections;

    uint private ordersCounter;

    // orderId => Order
    mapping(uint => Order) private orders;

    // Address (of token collection) => CollectionKey
    mapping(address => uint) private collectionKeys;

    constructor() {
      collectionCounter = 1;
      ordersCounter = 1;
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

    modifier collectionInMarketplace(address someAddress) {
      require(
        collectionKeys[someAddress] > 0,
        'Collection must be part of marketplace'
      );
      _;
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

      Order memory order = orders[ordersCounter];
      require(order.price == 0, 'A sell order already exists');

      order.price = _price;
      order.status = OrderStatus.open;
      order.tokenOwner = _msgSender();
      order.collection = _collection;
      order.token = _tokenId;
      order.ofType = OrderType.sell;
      orders[ordersCounter] = order;
      ordersCounter++;
      collection.transferFrom(_msgSender(), address(this), _tokenId);
    }

    function cancelSellOrder(
      uint _orderId
    ) public {
      Order memory order = orders[_orderId];

      require(order.price > 0, 'Order doesn\'t exist.');
      require(order.status == OrderStatus.open, 'Order must have status open');
      require(order.tokenOwner == _msgSender(), 'Only original token owner can cancel order');
      require(order.ofType == OrderType.sell, 'Order type must be sell');

      IERC721 collection = IERC721(order.collection);

      require(collection.ownerOf(order.token) == address(this),
      'Marketplace must be owner of token.');
      
      order.status = OrderStatus.cancelled;
      collection.transferFrom(address(this), _msgSender(), order.token);
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
}
