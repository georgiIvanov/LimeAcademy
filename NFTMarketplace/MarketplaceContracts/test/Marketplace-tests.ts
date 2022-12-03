import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'hardhat/internal/hardhat-network/stack-traces/model';
import { 
  Marketplace, Marketplace__factory,
  TokenCollection,
  TokenCollection__factory
} from '../typechain-types';
import * as helpers from './../scripts/helpers';

describe('Marketplace', () => {
  let marketplaceFactory: Marketplace__factory;
  let marketplace: Marketplace;
  let tokenCollectionFactory: TokenCollection__factory;

  before(async () => {
    marketplaceFactory = await ethers.getContractFactory('Marketplace');
    marketplace = await marketplaceFactory.deploy();
    tokenCollectionFactory = await ethers.getContractFactory('TokenCollection');
  });

  it('Should initialize', async () => {
    expect(await marketplace.feePercentage()).equal(30);
    expect(await marketplace.lockedBalance()).equal(0);
    expect(await marketplace.collectionsCount()).equal(0);
    expect(await marketplace.ordersCount()).equal(0);
    expect(await marketplace.balance()).equal(0);
  });

  it('Should create collection', async () => {
    await marketplace.createCollection(
      'Collection1', 'C1', 'First collection', 'baseUri.com/'
    );

    expect(await marketplace.collectionsCount()).equal(1);
  });

  it('Add collection', async () => {
    const tokenCollection = await tokenCollectionFactory.deploy(
      'Collection2', 'C2', 'Second collection', 'baseUriC2.com/'
    );

    await marketplace.addCollection(tokenCollection.address);

    expect(await marketplace.collectionsCount()).equal(2);
  });

  it('Prevents adding invalid collection', async () => {
    const emptyContractFactory = await ethers.getContractFactory('EmptyIERC165');
    const emptyContract = await emptyContractFactory.deploy();

    await expect(marketplace.addCollection(emptyContract.address))
    .to.be.revertedWith('Parameter must implement IERC721Metadata & IERC721Enumerable');
  });

  it('Sets market fee', async () => {
    await marketplace.setMarketFee(50);
    expect(await marketplace.feePercentage()).equal(50);

    await expect(marketplace.setMarketFee(1001))
    .to.be.revertedWith('Fee must be between 0 and 1000');

    const user1 = await helpers.user1();
    const userMarketplace = marketplace.connect(user1);
    
    await expect(userMarketplace.setMarketFee(30))
    .to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Makes sell order', async () => {
    // Create token
    const user1 = await helpers.user1();
    const user2 = await helpers.user2();
    
    const tokenCollectionFactory = await ethers.getContractFactory('TokenCollection');
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(user1);
    await collection.mint(user2.address, 'hash123');
    await collection.mint(user2.address, 'hash345');
    
    await collection.connect(user2).approve(marketplace.address, 1);

    // Make order
    const user2Marketplace = marketplace.connect(user2);
    await user2Marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('1.0'));

    await expect(user2Marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('1.0')))
    .revertedWith('A sell order already exists');
    await expect(user2Marketplace.makeSellOrder(collection.address, 0, helpers.ethToWei('1.0')))
    .to.revertedWith('Marketplace must be approver of token');
    await expect(user2Marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('0')))
    .to.revertedWith('Price for token must be above 0');

    expect(await marketplace.ordersCount()).equal(1);

    const order = await marketplace.getOrder(1);
    expect(order.price).equal(1000000000000000000n);
    expect(order.createdBy).equal(user2.address);
    expect(order.tokenOwner).equal(user2.address);
    expect(order.collection).equal(collection.address);
    expect(order.token).equal(1);
    expect(order.status).equal(helpers.OrderStatus.open);
    expect(order.ofType).equal(helpers.OrderType.sell);
  });

  it('Makes invalid sell order', async () => {
    const user1 = await helpers.user1();
    const emptyContractFactory = await ethers.getContractFactory('EmptyIERC165');
    const emptyContract = await emptyContractFactory.deploy();

    await expect(marketplace.makeSellOrder(emptyContract.address, 0, '100'))
    .to.be.revertedWith('Collection must be part of marketplace');

    const user1Marketplace = marketplace.connect(user1);
    await expect(user1Marketplace.makeSellOrder(emptyContract.address, 0, '100'))
    .to.be.revertedWith('Collection must be part of marketplace');
    
    const collection = tokenCollectionFactory.attach(await user1Marketplace.collections(1));
    await expect(user1Marketplace.makeSellOrder(collection.address, 0, '100'))
    .to.be.revertedWith('Seller must be owner of token');
  });

  it('Executes sell order', async () => {
    const buyer = await helpers.user1();
    const seller = await helpers.user2();

    const user1Marketplace = marketplace.connect(buyer);
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);

    expect(await collection.ownerOf(1)).equal(seller.address);
    await user1Marketplace.executeSellOrder(1, buyer.address, {
      value: helpers.ethToWei('2.0')
    });

    expect(await collection.ownerOf(1)).equal(buyer.address);
    expect(await seller.getBalance()).above(BigInt('10000949608000000000000'));
    expect(await marketplace.balance()).equal(BigInt('50000000000000000'));
  });

  it('Tries to execute invalid sell order', async () => {
    const seller = await helpers.user1();
    const buyer = await helpers.user2();
    const sellerMarketplace = marketplace.connect(seller);

    await expect(sellerMarketplace.executeSellOrder(55, seller.address))
    .revertedWith('Order doesn\'t exist');

    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);
    await collection.approve(sellerMarketplace.address, 1);
    await sellerMarketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('2'));

    await expect(sellerMarketplace.executeSellOrder(1, buyer.address))
    .revertedWith('Order must have status open');

    await expect(sellerMarketplace.executeSellOrder(2, buyer.address))
    .revertedWith('Not enought ether sent');

    // Branch - Nothing to return
    await marketplace.connect(buyer).executeSellOrder(2, buyer.address, {
      value: helpers.ethToWei('2')
    });

    const order = await marketplace.getOrder(2);
    expect(order.price).equal(2000000000000000000n);
    expect(order.createdBy).equal(seller.address);
    expect(order.tokenOwner).equal(seller.address);
    expect(order.collection).equal(collection.address);
    expect(order.token).equal(1);
    expect(order.status).equal(helpers.OrderStatus.executed);
    expect(order.ofType).equal(helpers.OrderType.sell);

    expect(await marketplace.balance()).equal(BigInt('150000000000000000'));
  });

  it('Cancels sell order', async () => {
    const seller = await helpers.user2();
    const buyer = await helpers.user1();
    const sellerMarketplace = marketplace.connect(seller);


    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);
    await collection.approve(sellerMarketplace.address, 1);
    await sellerMarketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('4'));
    await expect(sellerMarketplace.cancelSellOrder(55))
    .revertedWith('Order doesn\'t exist');
    await expect(sellerMarketplace.cancelSellOrder(1))
    .revertedWith('Order must have status open');
    await expect(marketplace.connect(buyer).cancelSellOrder(3))
    .revertedWith('Only original token owner can cancel order');

    await sellerMarketplace.cancelSellOrder(3);

    const order = await marketplace.getOrder(3);
    expect(order.price).equal(4000000000000000000n);
    expect(order.createdBy).equal(seller.address);
    expect(order.tokenOwner).equal(seller.address);
    expect(order.collection).equal(collection.address);
    expect(order.token).equal(1);
    expect(order.status).equal(helpers.OrderStatus.cancelled);
    expect(order.ofType).equal(helpers.OrderType.sell);
  });
});