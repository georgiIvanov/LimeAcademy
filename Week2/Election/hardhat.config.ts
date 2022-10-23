import { HardhatUserConfig, subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { main, deployWithParams } from './scripts/deploy';

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
    rinkeby: {
      url: "https://goerli.infura.io/v3/cfcc633692a3413eb62f966cd67d45cf",
      accounts: ['ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
    }
  }
};

export default config;

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

// The only difference from a task is that sub-task is not
// included in help messages.
subtask('print', 'Prints a message')
.addParam('message', 'The message to print')
.setAction(async (args) => {
  console.log(args.message);
});
