import { ITokenCollection } from "../contracts/types";

export class Collection {
  contract: ITokenCollection
  name: string
  tokensCount: number

  constructor(contract: ITokenCollection, name: string, tokensCount: number) {
    this.contract = contract;
    this.name = name;
    this.tokensCount = tokensCount;
  }
}