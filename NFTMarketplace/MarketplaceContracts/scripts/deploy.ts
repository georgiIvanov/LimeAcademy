import { HardhatEthersHelpers } from "hardhat/types";
import { ethers } from "hardhat";
import { TokenCollection, Marketplace } from "../typechain-types";
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
  console.log(' --- Deploy script ---- ');
  console.log('Signer ', owner.address);
  
  const marketplaceFactory = await ethers.getContractFactory('Marketplace');
  const marketplace = await marketplaceFactory.deploy();
  console.log("Marketplace contract deployed to:", marketplace.address);
  const collectionTx = await marketplace.createCollection(
    'Collection', 
    'CC', 
    'Some collection description', 
    'https://ipfs.io/ipfs/'
  );
  await collectionTx.wait();

  const collection = await ethers.getContractAt(
    'TokenCollection', 
    await marketplace.getCollection(1)
  );
  const approvalForAll = await collection.setApprovalForAll(marketplace.address, true);
  await approvalForAll.wait();
  console.log('Marketplace approved for all in collection:', collection.address);
  
  const mintTx = await collection.mint(owner.address, 'QmbBpR9SHdxard11tkcD59yc1Jq1XbRVu6uorjhUbhPkpt');
  await mintTx.wait();
  console.log('Token Uri:', await collection.tokenURI(1));
  
  await marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('1.0'));
  console.log('Created sell order');
  // Trying to make sell order a second time should fail
  // await marketplace.makeSellOrder(collection.address, 1, 10);
  // Trying to sell token that's not owned by that user should revert
  // await anotherUserTriesToSellToken(marketplace, collection);

  collection.transferFrom(owner.address, user1.address, 1).catch((error) => {
    console.log('Transfer failed. This is expected since sell order makes marketplace the token owner.');
  });

  // await marketplace.cancelSellOrder(1);
  // console.log('Cancelled sell order');

  // // Trying to cancel order twice should fail
  // marketplace.cancelSellOrder(1).catch((error) => {
  //   console.log('Second cancel of sell order fails, as expected.');
  // });

  console.log('Owner before executing sell:', await collection.ownerOf(1));
  await buySoldToken(marketplace, 1);
  console.log('Owner after executing sell:', await collection.ownerOf(1));

  console.log('Marketplace balance:', await marketplace.balance());
}

const buySoldToken = async (
  marketplace: Marketplace,
  orderId: number
) => {
  const user1 = await helpers.user1();
  console.log('Buyer ether before buy:', await user1.getBalance());
  const userMarketplace = marketplace.connect(user1);
  const tx = await userMarketplace.executeSellOrder(orderId, user1.address, { value: helpers.ethToWei('2') });
  await tx.wait();
  console.log('Buyer ether after buying:', await user1.getBalance());
  console.log('Seller balance:', await (await helpers.owner()).getBalance());
}

// We're expecting this to fail because
// only the owner of a token should be able to make sell order.
const anotherUserTriesToSellToken = async (
  marketplace: Marketplace,
  collection: TokenCollection
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
