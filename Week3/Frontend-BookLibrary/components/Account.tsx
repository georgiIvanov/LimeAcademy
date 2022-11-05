import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useState } from "react";
import { injected, walletConnect } from "../connectors";
import useENSName from "../hooks/useENSName";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import { formatEtherscanLink, shortenHex } from "../util";
import { ActionButton } from "./ActionButton";

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
      <div className="space-x-2">
        {isWeb3Available ? 
          <ActionButton onClick= {() => {
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
          disabled={connecting}
          title={isMetaMaskInstalled ? "Connect to MetaMask" : "Connect to Wallet"}/>
        : <ActionButton onClick= {startOnboarding} title='Install Metamask'/>
        }
        <ActionButton onClick= {async () => {
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
        title='Wallet Connect'
      />
      </div>
    );
  }

  return (
    <div className="space-x-2">
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
      <ActionButton onClick= {async () => {
          try {
            deactivate()
          } catch (e) {
            setError(error);
          }
        }}
        title='Disconnect'
      />
    </div>


  );
};

export default Account;