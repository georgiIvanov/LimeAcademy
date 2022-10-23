// import { ethers, run } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function main(hre: HardhatRuntimeEnvironment) {
  hre.run('compile');
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString()); 

  const USElectionFactory = await hre.ethers.getContractFactory("USElection");
  const usElection = await USElectionFactory.deploy();
  console.log("USElection deployed to:", usElection.address);
}
