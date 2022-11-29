// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import './TokenCollection.sol';
import './IMarketplace.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable, IMarketplace, ERC165 {
    uint public collectionsCount;
    mapping(uint => TokenCollection) public collections;

    // CollectionKey => TokenId => Order
    mapping(uint => mapping(uint => Order)) sellOrders;

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
            _description,
            address(this),
            collectionsCount
        );
        collection.transferOwnership(_msgSender());
        collections[collectionsCount] = collection;
        collectionsCount++;
    }

    modifier onlyICollection(address collection) {
      require(
        ERC721(collection).supportsInterface(
          type(ITokenCollection).interfaceId
        ),
        'Parameter (or caller) must be ITokenCollection'
      );
      _;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IMarketplace).interfaceId;
    }

    function getCollection(uint _index) public view returns(address) {
      return address(collections[_index]);
    }

    function receiveFee(address _seller) external payable override {
      emit MarketplaceFeeReceived(_msgSender(), _seller, msg.value);
    }

    function canTransferToken(uint tokenId) onlyICollection(_msgSender()) external view returns (bool) {
      ITokenCollection collection = ITokenCollection(_msgSender());
      uint key = collection.marketplaceKey();

      Order memory order = sellOrders[key][tokenId];
      return order.price == 0;
    }

    function makeSellOrder(
      address _collection, uint _tokenId, uint _price
    ) onlyICollection(_collection) public {
      ITokenCollection collection = ITokenCollection(_collection);
      require(collection.getApproved(_tokenId) == address(this), 
      'Marketplace must be approver.');

      require(collection.ownerOf(_tokenId) == _msgSender(),
      'Seller must be owner of token.');

      require(_price > 0, 'Price for token must be above 0.');

      uint key = collection.marketplaceKey();
      Order memory order = sellOrders[key][_tokenId];
      require(order.price == 0, 'A sell order already exists.');

      order.price = _price;
      sellOrders[key][_tokenId] = order;
    }

    function cancelSellOrder(
      address _collection, uint _tokenId
    ) onlyICollection(_collection) public {
      ITokenCollection collection = ITokenCollection(_collection);
      require(collection.getApproved(_tokenId) == address(this), 
      'Marketplace must be approver.');

      require(collection.ownerOf(_tokenId) == _msgSender(),
      'Seller must be owner of token.');

      uint key = collection.marketplaceKey();
      Order memory order = sellOrders[key][_tokenId];
      require(order.price > 0, 'Sell order doesn\'t exist.');

      delete sellOrders[key][_tokenId];
    }
}
