import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";

async function main(ethers: HardhatEthersHelpers) {
  const tokenContractFactory = await ethers.getContractFactory("TokenContract");
  const tokenContract = await tokenContractFactory.deploy('CC', 'Collection', 'Some collection description');
  console.log("Token contract deployed to:", tokenContract.address);
  console.log("Symbol:", await tokenContract.symbol(), 'Name:', await tokenContract.name());
  console.log("Description:", await tokenContract.description());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
