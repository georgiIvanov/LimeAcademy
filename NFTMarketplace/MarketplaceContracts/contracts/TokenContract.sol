// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// A token contract representing an NFT collection
contract TokenContract is ERC721 {
  string public description;

  constructor(
    string memory _symbol,
    string memory _name, 
    string memory _description
  ) ERC721(_name, _symbol) { 
    description = _description;
  }
}