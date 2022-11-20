// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

import './IMarketplace.sol';

// A token contract representing an NFT collection
contract CollectionContract is ERC721, Ownable {
  string public description;
  string public baseUri;
  IMarketplace public marketplace;
  uint private nextToken;

  constructor(
    string memory _symbol,
    string memory _baseUri,
    string memory _name, 
    string memory _description,
    IMarketplace _marketplace
  ) ERC721(_name, _symbol) {
    baseUri = _baseUri;
    description = _description;
    marketplace = _marketplace;
    nextToken = 1;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseUri;
  }

  function mint() onlyOwner public {
    super._safeMint(_msgSender(), nextToken);
    super.approve(address(marketplace), nextToken);
    nextToken++;
  }

  function tokensCount() public view returns (uint) {
    return nextToken - 1;
  }
}