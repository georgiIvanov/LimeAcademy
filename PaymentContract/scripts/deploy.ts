import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";

export const deployContract = async (ethers: HardhatEthersHelpers) => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const payFactory = await ethers.getContractFactory('PayMe');
  const payContract = await payFactory.deploy();
  console.log('Pay contract deployed to:', payContract.address);
}

// Deploys contract to a network
// Example: npx hardhat run --network localhost scripts/deploy.ts
// you can replace `localhost` with any network
deployContract(ethers)
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
