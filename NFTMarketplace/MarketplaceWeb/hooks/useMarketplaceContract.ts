import Marketplace_Abi from "../contracts/Marketplace.json";
import { Marketplace } from "../contracts/types/Marketplace";
import useContract from "./useContract";

export default function useMarketplaceContract(contractAddress?: string) {
  return useContract<Marketplace>(contractAddress, Marketplace_Abi);
}
