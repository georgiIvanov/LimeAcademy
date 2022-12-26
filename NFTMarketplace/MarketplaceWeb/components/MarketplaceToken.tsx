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
    <div className="w-52">
      <img src={token.metadata.image} />
      <h3 className="font-bold">{token.metadata.name}</h3>
      <div>{token.metadata.description}</div>
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
  );
}