import { HardhatRuntimeEnvironment } from "hardhat/types";

export const hardhatRun = async (hre: HardhatRuntimeEnvironment) => {
  console.log(hre,ethers.version);
};

