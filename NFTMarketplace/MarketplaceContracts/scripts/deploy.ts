import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";
import { CollectionContract, Marketplace } from "../typechain-types";

async function main(ethers: HardhatEthersHelpers) {
  // const tokenContractFactory = await ethers.getContractFactory("TokenContract");
  // const tokenContract = await tokenContractFactory.deploy(
  //   'CC', 
  //   'https://globalgrind.com/wp-content/uploads/sites/16/2022/02/16450451491794.jpg', 
  //   'Collection', 
  //   'Some collection description'
  // );
  // // const tokenContract = await tokenContractFactory.deploy('CC', 'Collection', 'Some collection description');
  // console.log("Token contract deployed to:", tokenContract.address);
  // console.log("Symbol:", await tokenContract.symbol(), 'Name:', await tokenContract.name());
  // console.log("Description:", await tokenContract.description());

  console.log('Signer ', (await signer()).address);
  
  const marketplaceFactory = await ethers.getContractFactory('Marketplace');
  const marketplaceContract = await marketplaceFactory.deploy();
  console.log("Marketplace contract deployed to:", marketplaceContract.address);
  const collectionTx = await marketplaceContract.createCollection(
    'Collection', 
    'CC', 
    'Some collection description', 
    'https://ipfs.io/ipfs/'
  );
  await collectionTx.wait();

  const collection = await ethers.getContractAt(
    'CollectionContract', 
    await marketplaceContract.getCollection(0)
  );
  console.log(' --- Deploy script ---- ')
  console.log('Collection owner:', await collection.owner())
  const mintTx = await collection.mint('QmbBpR9SHdxard11tkcD59yc1Jq1XbRVu6uorjhUbhPkpt');
  await mintTx.wait();
  const isApproved = await collection.getApproved(1);
  console.log('Approved:', isApproved);
  console.log('Token Uri:', await collection.tokenURI(1));
  
  const sellTx = await marketplaceContract.makeSellOrder(collection.address, 1);
  // await anotherUserTriesToSellToken(marketplaceContract, collection, 1);
}

// We're expecting this to fail because
// only the owner of a token should be able to make sell order.
const anotherUserTriesToSellToken = async (
  marketplace: Marketplace,
  collection: CollectionContract,
  tokenId: number
) => {
  const userMarketplace = marketplace.connect(await user1());
  const sellTx = await userMarketplace.makeSellOrder(collection.address, 1);
};

export let signer = async () => {
  return (await ethers.getSigners())[0];
}

export let user1 = async () => {
  return (await ethers.getSigners())[1];
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
