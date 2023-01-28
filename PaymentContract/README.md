# PayMe project
A simple payment contract we're deploying on a test net and then
using to test EIP681 and [QR code generation](https://brunobar79.github.io/eip681-link-generator/#).



## Interact
Localhost
`npx hardhat payme-interact`

## Deploy contract on Goerli network
1. Create `.env` file at root directory
- Add key values for `GOERLI_PRIVATE_KEY` and `INFURA_GOERLI`

2. Run the following command
`npx hardhat run scripts/deploy.ts --network goerli`

## Deploy on other networks

By using the same convention as in the example for Goerli,
you can deploy ro sepolia or mumbai.

You would first have to add `[network]_PRIVATE_KEY` & `INFURA_[network]` keys in `.env`.

Then, `npx hardhat run scripts/deploy.ts --network [network]`

## Deploy contract on local node

1. `npx hardhat node` (In separate terminal window)
2. `npx hardhat run --network localhost scripts/deploy.ts`

## Tests

Run all tests
`npx hardhat test`
