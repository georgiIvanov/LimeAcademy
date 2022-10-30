import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv"
import { hardhatRun } from "./scripts/interact";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    goerli: {
      url: process.env.INFURA_API_KEY,
      accounts: [process.env.GOERLI_PRIVATE_KEY || '']
    }
  }
};

export default config;

task('interact', 'Interacts with book library contract')
.setAction(async (args, hre, runSuper) => {
  await hardhatRun(hre);
});