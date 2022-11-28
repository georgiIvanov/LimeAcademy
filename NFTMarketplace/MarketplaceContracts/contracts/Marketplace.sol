// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import './CollectionContract.sol';
import './IMarketplace.sol';

import "hardhat/console.sol";

contract Marketplace is Ownable, IMarketplace, ERC165 {
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
            address(this)
        );
        collection.transferOwnership(_msgSender());
        collections[collectionsCount] = collection;
        collectionsCount++;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IMarketplace).interfaceId;
    }

    function receiveFee(address seller) external payable override {
      emit MarketplaceFeeReceived(_msgSender(), seller, msg.value);
    }
}
