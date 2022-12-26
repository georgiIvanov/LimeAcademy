import { useWeb3React } from "@web3-react/core";
import { Token } from "../models/Token";
import { formatEtherscanLink, shortenHex } from "../util";

type MarketplaceTokenProps = {
  token: Token;
};

export const MarketplaceToken = ({token}: MarketplaceTokenProps): JSX.Element => {
  const { active, error, activate, deactivate, chainId, account, setError } =
    useWeb3React();
  return (
    <div className="component-background overflow-hidden rounded-md shadow">
      <img className="w-full" src={token.metadata.image} />
      <div className="m-2">
        <h3 className="font-bold text-main">{token.metadata.name}</h3>
        <div className="text-sm text-secondary">{token.metadata.description}</div>
        <a
          {...{
            href: formatEtherscanLink("Account", [chainId, token.ownerAddress]),
            target: "_blank",
            rel: "noopener noreferrer",
          }}
          className='text-main text-xs'
        >
        Owner: {`${shortenHex(token.ownerAddress, 4)}`}
        </a>
      </div>
    </div>
  );
}