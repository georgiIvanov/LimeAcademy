// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './CollectionContract.sol';
import './IMarketplace.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable, IMarketplace {
    uint public collectionsCount;
    mapping(uint => CollectionContract) public collections;

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
            this
        );
        collection.transferOwnership(_msgSender());
        collections[collectionsCount] = collection;
        collectionsCount++;
        
        console.log("Collection ->");
        console.log('Address:', address(collection));
    }

    function getCollection(uint index) public view returns(address) {
      return address(collections[index]);
    }

    function receiveFee(address seller) external payable override {
      emit MarketplaceFeeReceived(_msgSender(), seller, msg.value);
    }
}
