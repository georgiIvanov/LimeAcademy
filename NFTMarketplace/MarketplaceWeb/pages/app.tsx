import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { MARKETPLACE_ADDRESS } from "../constants";
import { Route } from "../constants/route";
import useMarketplaceContract from "../hooks/useMarketplaceContract";

type AppProps = {
  route: Route;
}

class AppState {
  marketplaceOwner: string;
  collectionsCount: number;
}

export const App = ({route}: AppProps): JSX.Element => {
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const { account } = useWeb3React<Web3Provider>();
  const [state, setState] = useState<AppState>(new AppState());

  useEffect(() => {
    getMarketplaceInfo();
  }, [account]);

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

  switch (route) {
    case Route.Home: return <p>Home</p>
    case Route.Mint: return <p>Mint</p>
    case Route.Collection: return <p>Collection</p>
    case Route.Profile: return <p>Profile</p>
  }

  return (<p>App</p>);
}