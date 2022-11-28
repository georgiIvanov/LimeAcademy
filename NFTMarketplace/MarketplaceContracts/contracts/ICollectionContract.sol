// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface ICollectionContract is IERC721 {
  function marketplaceKey() external view returns(uint);
}