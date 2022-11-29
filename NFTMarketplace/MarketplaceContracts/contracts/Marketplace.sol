// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './TokenCollection.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable {
    uint private nextCollectionKey;

    // CollectionKey => TokenCollection
    mapping(uint => IERC721) public collections;

    // CollectionKey => TokenId => Order
    mapping(uint => mapping(uint => Order)) private sellOrders;

    // Address (of token collection) => CollectionKey
    mapping(address => uint) private collectionKeys;

    constructor() {
      nextCollectionKey = 1;
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
        collections[nextCollectionKey] = collection;
        collectionKeys[address(collection)] = nextCollectionKey;
        nextCollectionKey++;
    }

    modifier onlyTokenCollection(address someAddress) {
      require(
        IERC721(someAddress).supportsInterface(type(IERC721).interfaceId)
        && IERC721Metadata(someAddress).supportsInterface(type(IERC721Metadata).interfaceId),
        'Parameter must implement IERC721 & IERC721Metadata'
      );
      _;
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

      Order memory order = sellOrders[collectionKey][_tokenId];
      require(order.price == 0, 'A sell order already exists');

      order.price = _price;
      order.tokenOwner = _msgSender();
      sellOrders[collectionKey][_tokenId] = order;
      collection.transferFrom(_msgSender(), address(this), _tokenId);
    }

    function cancelSellOrder(
      address _collection, uint _tokenId
    ) collectionInMarketplace(_collection) public {
      IERC721 collection = IERC721(_collection);
      uint collectionKey = collectionKeys[_collection];

      require(collection.ownerOf(_tokenId) == address(this),
      'Marketplace must be owner of token.');

      Order memory order = sellOrders[collectionKey][_tokenId];
      require(order.price > 0, 'Sell order doesn\'t exist.');
      require(order.tokenOwner == _msgSender(), 'Only original token owner can cancel order');
      delete sellOrders[collectionKey][_tokenId];
      collection.transferFrom(address(this), _msgSender(), _tokenId);
    }

    function collectionsCount() public view returns (uint) {
      return nextCollectionKey - 1;
    }

    function getCollection(uint _index) public view returns(address) {
      require(_index > 0 && _index <= collectionsCount(), 
      'Index must be: 0 < index <= collectionsCount');
      return address(collections[_index]);
    }
}
