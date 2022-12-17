import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import NativeCurrencyBalance from "../components/NativeCurrencyBalance";
import TokenBalance from "../components/TokenBalance";
import { MARKETPLACE_ADDRESS } from "../constants";
import useEagerConnect from "../hooks/useEagerConnect";

function Home() {
  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <section>
            <Account triedToEagerConnect={triedToEagerConnect} />
            {isConnected && <NativeCurrencyBalance />}
          </section>
        </nav>
      </header>

      <main className="w-full">
        <h1 className="text-3xl font-bold underline content-center text-center">
          NFT Marketplace
        </h1>
        {isConnected && (
          // TODO: Add main component here
          <></>
        )}
      </main>
    </div>
  );
}

export default Home;
