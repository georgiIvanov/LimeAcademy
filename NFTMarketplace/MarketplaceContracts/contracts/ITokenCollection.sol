// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';

/*
  Intefrace that token collections in the marketplace must support.

  We're using this interface as ABI in the front-end 
  because not every collection instance in the marketplace 
  is guaranteed to be of type TokenCollection.
*/
interface ITokenCollection is IERC721Enumerable, IERC721Metadata {

}