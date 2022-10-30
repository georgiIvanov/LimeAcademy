import { HardhatRuntimeEnvironment } from "hardhat/types";
import { USElection__factory } from '../typechain-types';


export const georliRun = async (hre: HardhatRuntimeEnvironment) => {
  const provider = new hre.ethers.providers.InfuraProvider('goerli', {
    infura: process.env.INFURA_API_KEY
  });

  const latestBlock = await provider.getBlock('latest');
  console.log('Latest block: ' + latestBlock.hash);

  const wallet = new hre.ethers.Wallet(
    process.env.GOERLI_PRIVATE_KEY as string,
    provider
  );

  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance));

  const contractAddress = "0x2818009E32e37C406dE1b82053D440b016Be07FF"
  
  // Instantiates a contract that has no signers, has read-only access
  // (You can use provider or wallet in the last argument)
  const electionContract = new hre.ethers.Contract(contractAddress, USElection__factory.abi, wallet);

  // Logs contract's abi
  // console.log(electionContract);
  // Fetches bytecode for contract
  // console.log(await provider.getCode(contractAddress));

  const hasEnded = await electionContract.electionEnded();
  console.log("The election has ended:", hasEnded);

  const haveResultsForOhio = await electionContract.resultsSubmitted("Ohio");
  console.log("Have results for Ohio:", haveResultsForOhio);
  
  // Transaction will fail when executed twice
  const transactionOhio = await electionContract.submitStateResult({
    name: "Ohio",
    votesBiden: 250,
    votesTrump: 150,
    stateSeats: 24
  });
  
  const transactionReceipt = await transactionOhio.wait();
  if (transactionReceipt.status != 1) { // 1 means success
    console.log("Transaction was not successful")
    return
  }

  const currentLeader = await electionContract.currentLeader();
  console.log("Current leader", currentLeader);
};

