import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from 'hardhat';

export const hardhatRun = async (hre: HardhatRuntimeEnvironment) => {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
  const latestBlock = await provider.getBlock("latest");
  console.log('Latest block: ' + latestBlock.hash);

  const wallet = new hre.ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance));
};

