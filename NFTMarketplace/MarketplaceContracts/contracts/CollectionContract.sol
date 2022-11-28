// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './IMarketplace.sol';
import './ICollectionContract.sol';

import 'hardhat/console.sol';

// A token contract representing an NFT collection
contract CollectionContract is ERC721, Ownable, ICollectionContract {
    string public description;
    string public baseUri;
    IMarketplace public marketplace;

    uint private nextToken;
    uint private key;

    // Token id to metadata hash
    mapping(uint => string) metadata;

    constructor(
        string memory _symbol,
        string memory _baseUri,
        string memory _name,
        string memory _description,
        address _marketplace,
        uint _key
    ) ERC721(_name, _symbol) {
        require(
            ERC165(_marketplace).supportsInterface(
                type(IMarketplace).interfaceId
            )
        );

        baseUri = _baseUri;
        description = _description;
        marketplace = IMarketplace(_marketplace);
        nextToken = 1;
        key = _key;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function marketplaceKey() external view override returns (uint) {
      return key;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == type(ICollectionContract).interfaceId
        || super.supportsInterface(interfaceId);
    }

    // Mints a token from the collection.
    // Marketplace is set as approver.
    // 
    // - `hash` the ipfs hash of the token's metadata
    //
    function mint(string calldata _hash) public {
        super._safeMint(_msgSender(), nextToken);
        super.approve(address(marketplace), nextToken);
        metadata[nextToken] = _hash;
        nextToken++;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(marketplace.canTransferToken(tokenId),
        'Sell order for token exists, not eligible for transfer');

        super._transfer(from, to, tokenId);
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