import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";
import { injected, walletConnect } from "../connectors";
import useENSName from "../hooks/useENSName";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { formatEtherscanLink, shortenHex } from "../util";

type AccountProps = {
  triedToEagerConnect: boolean;
};

const Account = ({ triedToEagerConnect }: AccountProps) => {
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          >
            {isMetaMaskInstalled ? "Connect to MetaMask" : "Connect to Wallet"}
          </button>

        ) : (
          <button onClick={startOnboarding}>Install Metamask</button>
        )}
        {(<button
          disabled={connecting}
          onClick={async () => {
            try {
              await activate(walletConnect(), undefined, true)
            } catch (e) {
              if (error instanceof UserRejectedRequestError) {
                setConnecting(false);
              } else {
                setError(error);
              }
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          >
          Wallet Connect
        </button>)
        }
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
        className='py-2 px-2 bg-blue-100'
      >
        {ENSName || `${shortenHex(account, 4)}`}
      </a>
      <button
        onClick={async () => {
          try {
            deactivate()
          } catch (e) {
            setError(error);
          }
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        >
        Disconnect
      </button>
    </div>


  );
};

export default Account;