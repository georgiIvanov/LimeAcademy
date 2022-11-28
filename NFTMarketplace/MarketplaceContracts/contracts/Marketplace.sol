// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import './CollectionContract.sol';
import './IMarketplace.sol';
import './Order.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable, IMarketplace, ERC165 {
    uint public collectionsCount;
    mapping(uint => CollectionContract) public collections;

    // CollectionKey => TokenId => Order
    mapping(uint => mapping(uint => Order)) sellOrders;

    function createCollection(
        string calldata _name,
        string calldata _symbol,
        string calldata _description,
        string calldata _baseUri
    ) public {
        CollectionContract collection = new CollectionContract(
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

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IMarketplace).interfaceId;
    }

    function getCollection(uint _index) public view returns(address) {
      return address(collections[_index]);
    }

    function receiveFee(address _seller) external payable override {
      emit MarketplaceFeeReceived(_msgSender(), _seller, msg.value);
    }

    function canTransferToken(uint tokenId) external view returns (bool) {
      require(
        ERC721(_msgSender()).supportsInterface(
          type(ICollectionContract).interfaceId
        ),
        'Caller must be ICollectionContract'
      );

      ICollectionContract collection = ICollectionContract(_msgSender());
      uint key = collection.marketplaceKey();

      Order memory order = sellOrders[key][tokenId];
      return order.price == 0;
    }

    function makeSellOrder(address _collection, uint _tokenId, uint _price) public {
      require(
        ERC721(_collection).supportsInterface(
          type(ICollectionContract).interfaceId
        ),
        'Collection must be ICollectionContract'
      );

      ICollectionContract collection = ICollectionContract(_collection);
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
}
