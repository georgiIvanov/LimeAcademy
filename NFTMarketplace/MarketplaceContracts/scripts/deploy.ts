import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";
import { CollectionContract, Marketplace } from "../typechain-types";
import * as helpers from './helpers';

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

  const owner = await helpers.owner();
  const user1 = await helpers.user1();
  console.log('Signer ', owner.address);
  
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
  
  const sellTx = await marketplaceContract.makeSellOrder(collection.address, 1, 10);
  // Trying to make sell order a second time should fail
  // await marketplaceContract.makeSellOrder(collection.address, 1, 10);
  // await anotherUserTriesToSellToken(marketplaceContract, collection);

  collection.transferFrom(owner.address, user1.address , 1).catch((error) => {
    console.log('Transfer failed. This is expected since sell order is in progress.');
  });

  marketplaceContract.cancelSellOrder(collection.address, 1);
  marketplaceContract.cancelSellOrder(collection.address, 1).catch((error) => {
    console.log('Second cancel of sell order fails, as expected.');
  });
}

// We're expecting this to fail because
// only the owner of a token should be able to make sell order.
const anotherUserTriesToSellToken = async (
  marketplace: Marketplace,
  collection: CollectionContract
) => {
  const userMarketplace = marketplace.connect(await helpers.user1());
  const sellTx = await userMarketplace.makeSellOrder(collection.address, 1, 10);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(ethers).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
