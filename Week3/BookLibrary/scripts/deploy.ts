import { HardhatEthersHelpers, HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

export const deployContract = async (ethers: HardhatEthersHelpers) => {
  const bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await bookLibraryFactory.deploy();  
  console.log("BookLibrary contract deployed to:", bookLibrary.address);
}

// Deploys contract to a network
// Example: npx hardhat run --network localhost scripts/deploy.ts
// you can replace `localhost` with any network
deployContract(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
