import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from 'hardhat';
import { USElection, USElection__factory } from '../typechain-types';


export const hardhatRun = async (hre: HardhatRuntimeEnvironment) => {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
  const signer = provider.getSigner(0);

  const latestBlock = await provider.getBlock("latest");
  console.log('Latest block: ' + latestBlock.hash);

  const wallet = new hre.ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance));

  // Replace address
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
  
  // Instantiates a contract that has no signers, has read-only access
  // (You can use provider or wallet in the last argument)
  const electionContract = new hre.ethers.Contract(contractAddress, USElection__factory.abi, provider);
  
  // This contract can call owner functions
  const electionContractAsOwner = electionContract.connect(signer);

  // Logs contract's abi
  // console.log(electionContract);
  // Fetches bytecode for contract
  // console.log(await provider.getCode(contractAddress));

  const hasEnded = await electionContract.electionEnded();
  console.log("The election has ended:", hasEnded);

  const haveResultsForOhio = await electionContract.resultsSubmitted("Ohio");
  console.log("Have results for Ohio:", haveResultsForOhio);
  
  // Transaction will fail when executed twice
  const transactionOhio = await electionContractAsOwner.submitStateResult({
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

