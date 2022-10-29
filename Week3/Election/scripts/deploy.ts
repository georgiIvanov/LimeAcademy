import { HardhatEthersHelpers, HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

export const main = async (hre: HardhatRuntimeEnvironment) => {
  await hre.run('compile');
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString()); 

  const USElectionFactory = await hre.ethers.getContractFactory("USElection");
  const usElection = await USElectionFactory.deploy();
  console.log("USElection deployed to:", usElection.address);
}

export const deployWithParams = async (hre: HardhatRuntimeEnvironment, privateKey: string) => {
  await hre.run('compile');
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  console.log('Deploying contracts with the account:', wallet.address);
  console.log('Account balance:', (await wallet.getBalance()).toString());

  const USElectionFactory = await hre.ethers.getContractFactory("USElection", wallet);
  console.log('Waiting for USElection deployment...');
  const usElection = await USElectionFactory.deploy();
  console.log('USElection Contract address: ', usElection.address);
  console.log('Done!');

  await hre.run('verify:verify', {address: usElection.address});
}

// Deploys contract to localhost
export const deployContract = async (hre: HardhatRuntimeEnvironment, privateKey: string) => {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
  const wallet = new hre.ethers.Wallet(privateKey, provider);
  const USElectionFactory = await hre.ethers.getContractFactory("USElection", wallet);
  const usElection = await USElectionFactory.deploy();
  console.log('USElection Contract address: ', usElection.address);
}

