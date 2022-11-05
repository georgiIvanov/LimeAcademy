import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Account from "../components/Account";
import { BookLibrary } from "../components/BookLibrary";
import NativeCurrencyBalance from "../components/NativeCurrencyBalance";

import useEagerConnect from "../hooks/useEagerConnect";

function Home() {
  const { account, library } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
      <Head>
        <title>LimeAcademy-boilerplate</title>
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
          Book Library
        </h1>
        {isConnected && (
          <BookLibrary />
        )}
      </main>
    </div>
  );
}

export default Home;
