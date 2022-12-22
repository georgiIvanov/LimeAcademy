import { BigNumber } from "ethers"

export type Token = {
  tokenId: BigNumber;
  metadataUri: string;
  metadata: TokenMetadata | string;
}

export type TokenMetadata = {
  name: string;
  description: string;
  image: string;
}
