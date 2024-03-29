import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
import { payMeInteract } from "./scripts/interact";

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
      url: process.env.INFURA_GOERLI,
      accounts: [process.env.GOERLI_PRIVATE_KEY || ''],
      chainId: 5
    },
    sepolia: {
      url: process.env.INFURA_SEPOLIA,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY || ''],
      chainId: 11155111
    },
    mumbai: {
      url: process.env.INFURA_MUMBAI,
      accounts: [process.env.MUMBAI_PRIVATE_KEY || ''],
      chainId: 80001
    }
  }
};

export default config;

task('payme-interact', 'Interacts with pay me contract')
.setAction(async (args, hre, runSuper) => {
  await payMeInteract(hre.ethers);
});