# Sample Hardhat Project

This project builds on what we've learned in the past three weeks.

We're using it to explore how to work with ethers.js
- Connect to various networks 
- How create wallets
- Call contracts

# Interact on local node

First, run a local node:
`npx hardhat node`

Second, deploy the election contract:
`npx hardhat deploy-localhost --private-key [value]`

Then run
`npx hardhat interact`

# Deploy on goerli 

`npx hardhat deploy-testnets --network goerli`

Interact

`npx hardhat interact-goerli --network goerli`