import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import NativeCurrencyBalance from "../components/NativeCurrencyBalance";
import { NavigationBar } from "../components/NavigationBar";
import Account from "../components/Account";
import { Welcome } from "../components/Welcome";
import useEagerConnect from "../hooks/useEagerConnect";
import { Route } from "../constants/route";
import { useState } from "react";
import { App } from "./app";

function Home() {
  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;
  const [route, setRoute] = useState<Route>(Route.Home);

  let content = isConnected
    ? <App route={route}/>
    : <Welcome connect={<Account triedToEagerConnect={triedToEagerConnect} balance={<></>} />} />

  return (
    <div className="background">
      <Head>
        <title>NFT Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <NavigationBar
          triedToEagerConnect={triedToEagerConnect}
          balance={isConnected && <NativeCurrencyBalance />}
          setRoute={setRoute}
        />
      </header>

      <main className="w-full">
        {content}
      </main>
    </div>
  );
}

export default Home;
