import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";

export const deployContract = async (ethers: HardhatEthersHelpers) => {
  const payFactory = await ethers.getContractFactory('PayMe');
  const payContract = await payFactory.deploy();
  console.log('Pay contract deployed to:', payContract.address);
}

// Deploys contract to a network
// Example: npx hardhat run --network localhost scripts/deploy.ts
// you can replace `localhost` with any network
deployContract(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
