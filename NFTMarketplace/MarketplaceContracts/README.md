# NFT Marketplace project

## Interact
Localhost
`npx hardhat interact`

## Deploy contract on Goerli network
1. Create `.env` file at root directory
- Add key values for `GOERLI_PRIVATE_KEY` and `INFURA_API_KEY`

2. Run the following command
`npx hardhat run scripts/deploy.ts --network goerli`

## Deploy contract on local node

1. `npx hardhat node` (In separate terminal window)
2. `npx hardhat run --network localhost scripts/deploy.ts`

## Tests

Run all tests
`npx hardhat test`
