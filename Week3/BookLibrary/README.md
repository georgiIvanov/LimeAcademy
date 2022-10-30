# BookLibrary Week3

Book library contract written in Solidity.

## Interact
Localhost
`npx hardhat interact`

Goerli
`npx hardhat interact-goerli`

## Deploy contract on Goerli network
1. Create `.env` file at root directory
- Add key values for `GOERLI_PRIVATE_KEY` and `INFURA_API_KEY`

2. Run the following command
`npx hardhat run scripts/deploy.ts --network goerli`

## Deploy contract on local node

1. `npx hardhat node` (In separate terminal window)
2. `npx hardhat run --network localhost scripts/deploy.ts`

----

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
