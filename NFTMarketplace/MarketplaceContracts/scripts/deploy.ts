import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";

export const deployContract = async (ethers: HardhatEthersHelpers) => {
  const marketplaceFactory = await ethers.getContractFactory("Marketplace");
  const marketplace = await marketplaceFactory.deploy();  
  console.log("Marketplace contract deployed to:", marketplace.address);
}

// Deploys contract to a network
// Example: npx hardhat run --network localhost scripts/deploy.ts
// you can replace `localhost` with any network
deployContract(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
