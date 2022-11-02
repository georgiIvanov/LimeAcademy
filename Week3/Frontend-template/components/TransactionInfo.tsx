import { formatEtherscanLink } from "../util"

export interface TransactionInfoProps {
  transactionHash: string | null;
}

export const TransactionInfo = ({ transactionHash } : TransactionInfoProps): JSX.Element => {
  if (transactionHash == null) {
    return <></>;
  } else {
    const link = formatEtherscanLink('Transaction', [5, transactionHash]);
    return (
      <div>
        <p>{transactionHash}</p>
        <a href={link}><u>Etherscan link</u></a>
      </div>
    );
  }
}
