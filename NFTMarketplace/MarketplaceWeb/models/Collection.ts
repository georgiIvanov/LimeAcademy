import { ITokenCollection } from "../contracts/types";
import { Token } from "./Token";

export class Collection {
  contract: ITokenCollection
  name: string
  tokensCount: number
  tokens: Token[]

  constructor(
    contract: ITokenCollection, 
    name: string, 
    tokensCount: number
  ) {
    this.contract = contract;
    this.name = name;
    this.tokensCount = tokensCount;
    this.tokens = [];
  }
}