import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";
import { injected, walletConnect } from "../connectors";
import useENSName from "../hooks/useENSName";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { formatEtherscanLink, shortenHex } from "../util";

type AccountProps = {
  triedToEagerConnect: boolean;
  balance: JSX.Element;
};

const Account = ({ triedToEagerConnect, balance }: AccountProps) => {
  const { active, error, activate, deactivate, chainId, account, setError } =
    useWeb3React();

  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding,
  } = useMetaMaskOnboarding();

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  const ENSName = useENSName(account);

  if (error) {
    return null;
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    return (
      <div>
        {isWeb3Available ? (
          <button
            disabled={connecting}
            onClick={() => {
              setConnecting(true);

              activate(injected, undefined, true).catch((error) => {
                // ignore the error if it's a user rejected request
                if (error instanceof UserRejectedRequestError) {
                  setConnecting(false);
                } else {
                  setError(error);
                }
              });
            }}
            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white element-main border-white hover:border-transparent hover:text-blue-400 hover:bg-white mt-4 mr-4 lg:mt-0"
          >
            {isMetaMaskInstalled ? "Connect" : "Connect to Wallet"}
          </button>

        ) : (
          <button onClick={startOnboarding}>Install Metamask</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <a
        {...{
          href: formatEtherscanLink("Account", [chainId, account]),
          target: "_blank",
          rel: "noopener noreferrer",
        }}
        className='py-2 px-2 text-main'
      >
        Address: {ENSName || `${shortenHex(account, 4)}`}
      </a>
      <span className="text-main mr-12">
          {balance}
      </span>
      <button
        onClick={async () => {
          try {
            deactivate()
          } catch (e) {
            setError(error);
          }
        }}
        className="inline-block text-sm px-4 py-2 leading-none border rounded text-main background border-white hover:border-transparent hover:text-secondary hover:bg-white mt-4 lg:mt-0"
        >
        Disconnect
      </button>
    </div>


  );
};

export default Account;