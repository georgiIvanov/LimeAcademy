import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";

import NativeCurrencyBalance from "../components/NativeCurrencyBalance";
import { NavigationBar } from "../components/NavigationBar";
import Account from "../components/Account";
import TokenBalance from "../components/TokenBalance";
import { Welcome } from "../components/Welcome";
import { MARKETPLACE_ADDRESS } from "../constants";
import useEagerConnect from "../hooks/useEagerConnect";

function Home() {
  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  let content = isConnected ?
  <></>
  : <Welcome connect={<Account triedToEagerConnect={triedToEagerConnect} balance={<></>} /> } />

  return (
    <div className="background">
      <Head>
        <title>NFT Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <NavigationBar triedToEagerConnect={ triedToEagerConnect } balance={isConnected && <NativeCurrencyBalance />}/>
      </header>

      <main className="w-full">
        {content}
      </main>
    </div>
  );
}

export default Home;
