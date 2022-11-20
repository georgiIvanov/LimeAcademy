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

  // Token id to metadata hash
  mapping(uint => string) metadata;

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

  // Mints a token from the collection
  // 
  // - `hash` the ipfs hash of the token's metadata
  // 
  function mint(string calldata _hash) public {
    super._safeMint(_msgSender(), nextToken);
    super.approve(address(marketplace), nextToken);
    metadata[nextToken] = _hash;
    nextToken++;
  }

  // URI for the token's metadata
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
      _requireMinted(tokenId);

      string memory baseURI = _baseURI();
      return string(abi.encodePacked(baseURI, metadata[tokenId]));
  }

  // Tokens count that have been minted so far.
  function tokensCount() public view returns (uint) {
    return nextToken - 1;
  }
}