// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import 'hardhat/console.sol';

// A token contract representing an NFT collection
contract TokenCollection is ERC721 {
    string public description;
    string public baseUri;

    uint private nextToken;

    // Token id to metadata hash
    mapping(uint => string) metadata;

    constructor(
        string memory _symbol,
        string memory _baseUri,
        string memory _name,
        string memory _description
    ) ERC721(_name, _symbol) {
        baseUri = _baseUri;
        description = _description;
        nextToken = 1;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    // Mints a token from the collection.
    // Marketplace is set as approver.
    // 
    // - `metadataHash` the ipfs hash of the token's metadata
    //
    function mint(address to, string calldata _metadataHash) public {
        super._safeMint(to, nextToken);
        metadata[nextToken] = _metadataHash;
        nextToken++;
    }

    // URI for the token's metadata
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, metadata[tokenId]));
    }

    // Tokens count that have been minted so far.
    function tokensCount() public view returns (uint) {
        return nextToken - 1;
    }
}