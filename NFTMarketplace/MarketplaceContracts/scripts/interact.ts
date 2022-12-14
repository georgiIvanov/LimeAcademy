import { HardhatEthersHelpers } from "hardhat/types";
import { TokenCollection, Marketplace } from "../typechain-types";
import * as helpers from './helpers';

export async function interact(ethers: HardhatEthersHelpers) {
  const owner = await helpers.owner(ethers);
  const user1 = await helpers.user1(ethers);
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
  console.log('Token Uri:', await collection.tokenURI(0));
  
  await marketplace.makeSellOrder(collection.address, 0, helpers.ethToWei('1.0'));
  console.log('Created sell order');
  // Trying to make sell order a second time should fail
  // await marketplace.makeSellOrder(collection.address, 1, 10);
  // Trying to sell token that's not owned by that user should revert
  // await anotherUserTriesToSellToken(ethers, marketplace, collection);

  // await marketplace.cancelSellOrder(1);
  // console.log('Cancelled sell order');

  // // Trying to cancel order twice should fail
  // marketplace.cancelSellOrder(1).catch((error) => {
  //   console.log('Second cancel of sell order fails, as expected.');
  // });

  console.log('Owner before executing sell:', await collection.ownerOf(0));
  await buySoldToken(ethers, marketplace, 1);
  console.log('Owner after executing sell:', await collection.ownerOf(0));

  console.log('Marketplace balance:', await marketplace.balance());

  console.log('Making buy order');
  await marketplace.makeBuyOrder(collection.address, 0, { value: helpers.ethToWei('1.0') });

  console.log('Locked balance:', await marketplace.lockedBalance());
  
  // Trying to place buy order for non-existing tokenId fails
  // marketplace.makeBuyOrder(collection.address, 999, { value: helpers.ethToWei('1.0') });

  // Placing buy order second time fails
  // marketplace.makeBuyOrder(collection.address, 1, { value: helpers.ethToWei('1.0') });

  // console.log(await marketplace.getOrder(2));
  // await marketplace.cancelBuyOrder(2);

  await acceptBuyOffer(ethers, marketplace, collection, 2, 0);
  console.log('Locked balance:', await marketplace.lockedBalance());
}

const acceptBuyOffer = async (
  ethers: HardhatEthersHelpers,
  marketplace: Marketplace,
  collection: TokenCollection,
  orderId: number,
  tokenId: number
) => {
  const user1 = await helpers.user1(ethers);
  const userCollection = collection.connect(user1);
  userCollection.approve(marketplace.address, tokenId)
  
  console.log('Executing buy order');
  
  console.log('Seller ether before buy:', await user1.getBalance());
  const userMarketplace = marketplace.connect(user1);
  await userMarketplace.executeBuyOrder(orderId);
  console.log('Seller ether after buy:', await user1.getBalance());

}

const buySoldToken = async (
  ethers: HardhatEthersHelpers,
  marketplace: Marketplace,
  orderId: number
) => {
  const user1 = await helpers.user1(ethers);
  console.log('Buyer ether before buy:', await user1.getBalance());
  const userMarketplace = marketplace.connect(user1);
  const tx = await userMarketplace.executeSellOrder(orderId, user1.address, { value: helpers.ethToWei('2') });
  await tx.wait();
  console.log('Buyer ether after buying:', await user1.getBalance());
  console.log('Seller balance:', await (await helpers.owner(ethers)).getBalance());
}

// We're expecting this to fail because
// only the owner of a token should be able to make sell order.
const anotherUserTriesToSellToken = async (
  ethers: HardhatEthersHelpers,
  marketplace: Marketplace,
  collection: TokenCollection
) => {
  const userMarketplace = marketplace.connect(await helpers.user1(ethers));
  const sellTx = await userMarketplace.makeSellOrder(collection.address, 1, 10);
};
