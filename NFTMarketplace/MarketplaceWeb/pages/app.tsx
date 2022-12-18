import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Contract } from "ethers";
import { useEffect, useState } from "react";
import { Route } from "../constants/route";
import { ITokenCollection } from "../contracts/types";
import ITokenCollection_abi from "../contracts/ITokenCollection.json";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { CreateCollection } from "./createCollection";
import { Mint } from "./mint";
import { Collection } from "../models/Collection";

type AppProps = {
  route: Route;
}

class AppState {
  marketplaceOwner: string;
  collectionsCount: number;
  collections: Collection[];
}

export const App = ({ route }: AppProps): JSX.Element => {
  const marketplaceContract = useMarketplaceContract(process.env.MARKETPLACE_ADDRESS);
  const { library, account } = useWeb3React<Web3Provider>();
  const [state, setState] = useState<AppState>(new AppState());

  useEffect(() => {
    getMarketplaceInfo();
  }, [account]);

  useEffect(() => {
    if (state.collectionsCount == undefined || state.collectionsCount == 0) {
      return;
    }
    getCollections();
  }, [state.collectionsCount]);

  const getMarketplaceInfo = async () => {
    const marketplaceOwner = await marketplaceContract.owner();
    const collectionsCount = await marketplaceContract.collectionsCount();
    const newState = {
      ...state,
      marketplaceOwner: marketplaceOwner,
      collectionsCount: collectionsCount.toNumber()
    } as AppState;
    setState(newState);
  };

  const getCollections = async () => {
    console.log('Will fetch collections', state.collectionsCount);

    const res = Array.from(Array(state.collectionsCount).keys()).reverse().map(x => x + 1);
    const collections = await Promise.all(res.flatMap(async (id) => {
      const address = await marketplaceContract.getCollection(id);
      try {
        const contract = new Contract(address, ITokenCollection_abi, library.getSigner(account)) as ITokenCollection;
        const name = await contract.name();
        const tokensCount = (await contract.totalSupply()).toNumber();
        return new Collection(contract, name, tokensCount);
      } catch (error) {
        console.error("Failed To Get Token Collection", error);
        return null;
      }
    }));
    
    const newState = {
      ...state,
      collections: collections
    }
    setState(newState);
  }

  switch (route) {
    case Route.Home: return <p>Home</p>
    case Route.Mint: return <Mint collections={state.collections}/>
    case Route.Collection: return <CreateCollection
      marketplace={marketplaceContract}
      getMarketplaceInfo={getMarketplaceInfo}
    />
    case Route.Profile: return <p>Profile</p>
  }
}