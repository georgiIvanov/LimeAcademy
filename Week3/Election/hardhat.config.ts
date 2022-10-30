import { HardhatUserConfig, subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomiclabs/hardhat-etherscan';
import { main, deployWithParams, deployContract } from './scripts/deploy';
import { hardhatRun } from './scripts/interact';
import dotenv from "dotenv"

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
    localhost: {
      url: 'http://127.0.0.1:8545/'
    },
    goerli: {
      url: process.env.INFURA_API_KEY,
      accounts: [process.env.GOERLI_PRIVATE_KEY || '']
    },
  },
  etherscan: {
    apiKey: 'CHIRAADNUI814XIT9ST36R63UFNBNDKBDY'
  }
};

export default config;

task('interact', 'Interacts with election contract')
.setAction(async (args, hre, runSuper) => {
  await hardhatRun(hre);
  await hre.run('print', { message: 'Interact task done! '});
});

task('deploy-testnets', 'Deploys contract on a provided network')
.setAction(async (args, hre, runSuper) => {
  await main(hre);
  // Example on running a sub-task
  await hre.run('print', { message: 'Subtask: Done! '});
});

task('deploy-mainnet', 'Deploys contract on a provided network')
.addParam('privateKey', 'Please provide the private key')
.setAction(async (args: { privateKey: string }, hre) => {
  await deployWithParams(hre, args.privateKey);
});

task('deploy-localhost', 'Deploys contract on a local node')
.addParam('privateKey', 'Please provide the private key')
.setAction(async (args: { privateKey: string }, hre) => {
  await deployContract(hre, args.privateKey);
});

// The only difference from a task is that sub-task is not
// included in help messages.
subtask('print', 'Prints a message')
.addParam('message', 'The message to print')
.setAction(async (args) => {
  console.log(args.message);
});
