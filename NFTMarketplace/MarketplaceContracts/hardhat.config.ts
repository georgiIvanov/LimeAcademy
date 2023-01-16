import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
import { interact } from "./scripts/interact";
import { payMeInteract } from "./scripts/payme-interact";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
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
  await interact(hre.ethers);
});

task('payme-interact', 'Interacts with pay me contract')
.setAction(async (args, hre, runSuper) => {
  await payMeInteract(hre.ethers);
});