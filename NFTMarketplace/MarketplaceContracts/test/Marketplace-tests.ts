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
    await expect(await marketplace.createCollection(
      'Collection1', 'C1', 'First collection', 'baseUri.com/'
    ))
    .emit(marketplace, 'CollectionAdded')
    .withArgs('Collection1', 'C1', (await helpers.owner()).address);

    expect(await marketplace.collectionsCount()).equal(1);
  });

  it('Add collection', async () => {
    const tokenCollection = await tokenCollectionFactory.deploy(
      'Collection2', 'C2', 'Second collection', 'baseUriC2.com/'
    );

    await expect(await marketplace.addCollection(tokenCollection.address))
    .emit(marketplace, 'CollectionAdded')
    .withArgs(tokenCollection.name, tokenCollection.symbol, (await helpers.owner()).address);;

    expect(await marketplace.collectionsCount()).equal(2);
  });

  it('Prevents adding invalid collection', async () => {
    const emptyContractFactory = await ethers.getContractFactory('EmptyIERC165');
    const emptyContract = await emptyContractFactory.deploy();

    await expect(marketplace.addCollection(emptyContract.address))
    .to.be.revertedWith('Parameter must implement IERC721Metadata & IERC721Enumerable');
  });

  it('Sets market fee', async () => {
    // Owner sets market fee
    await expect(marketplace.setMarketFee(50))
    .emit(marketplace, 'MarketFeeSet')
    .withArgs(50);

    expect(await marketplace.feePercentage()).equal(50)
    
    // Invalid cases of setting market fee
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
    
    // Mint two tokens
    await collection.mint(user2.address, 'hash123');
    await expect(await collection.mint(user2.address, 'hash345'))
    .emit(collection, 'TokenMinted')
    .withArgs(1, user2.address, user1.address);
    
    await collection.connect(user2).approve(marketplace.address, 1);

    // Make order
    const priceWei = helpers.ethToWei('1.0');
    const user2Marketplace = marketplace.connect(user2);
    await expect(await user2Marketplace.makeSellOrder(collection.address, 1, priceWei))
    .emit(user2Marketplace, 'SellOrderCreated')
    .withArgs(collection.address, 1, priceWei, user2.address);

    // Invalid cases of making a sell order
    await expect(user2Marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('1.0')))
    .revertedWith('A sell order already exists');
    await expect(user2Marketplace.makeSellOrder(collection.address, 0, helpers.ethToWei('1.0')))
    .to.revertedWith('Marketplace must be approver of token');
    await expect(user2Marketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('0')))
    .to.revertedWith('Price for token must be above 0');

    expect(await marketplace.ordersCount()).equal(1);

    // Check if order is created correctly
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
    const tokenOwner = await helpers.user2();
    const emptyContractFactory = await ethers.getContractFactory('EmptyIERC165');
    const emptyContract = await emptyContractFactory.deploy();

    await expect(marketplace.makeSellOrder(emptyContract.address, 0, '100'))
    .revertedWith('Collection must be part of marketplace');

    const user1Marketplace = marketplace.connect(user1);
    await expect(user1Marketplace.makeSellOrder(emptyContract.address, 0, '100'))
    .revertedWith('Collection must be part of marketplace');
    
    const collection = tokenCollectionFactory.attach(await user1Marketplace.collections(1));
    await expect(user1Marketplace.makeSellOrder(collection.address, 0, '100'))
    .revertedWith('Seller must be owner of token');

    await expect(marketplace.connect(tokenOwner).makeSellOrder(collection.address, 55, 100))
    .revertedWith('ERC721: invalid token ID');
  });

  it('Executes sell order', async () => {
    const buyer = await helpers.user1();
    const seller = await helpers.user2();

    const user1Marketplace = marketplace.connect(buyer);
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);

    expect(await collection.ownerOf(1)).equal(seller.address);
    await expect(
      await user1Marketplace.executeSellOrder(1, buyer.address, {
        value: helpers.ethToWei('2.0')
      })
    ).emit(user1Marketplace, 'SellOrderExecuted')
    .withArgs(
      collection.address, 1, helpers.ethToWei('1.0'), buyer.address,
      950000000000000000n, 50000000000000000n
    );

    expect(await collection.ownerOf(1)).equal(buyer.address);
    expect(await seller.getBalance()).above(BigInt('10000949400000000000000'));
    expect(await marketplace.balance()).equal(BigInt('50000000000000000'));
  });

  it('Tries to execute invalid sell order', async () => {
    const seller = await helpers.user1();
    const buyer = await helpers.user2();
    const sellerMarketplace = marketplace.connect(seller);

    // Invalid execute of sell order
    await expect(sellerMarketplace.executeSellOrder(55, seller.address))
    .revertedWith('Order doesn\'t exist');

    // Make sell order
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);
    await collection.approve(sellerMarketplace.address, 1);
    await sellerMarketplace.makeSellOrder(collection.address, 1, helpers.ethToWei('2'));

    // Invalid execute of sell order
    await expect(sellerMarketplace.executeSellOrder(1, buyer.address))
    .revertedWith('Order must have status open');
    await expect(sellerMarketplace.executeSellOrder(2, buyer.address))
    .revertedWith('Not enought ether sent');

    // Executing sell order, no change return to buyer
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

    // Make sell order
    const priceWei = helpers.ethToWei('4');
    const collection = tokenCollectionFactory.attach(await marketplace.getCollection(1)).connect(seller);
    await collection.approve(sellerMarketplace.address, 1);
    await sellerMarketplace.makeSellOrder(collection.address, 1, priceWei);

    // Invalid cancel cases
    await expect(sellerMarketplace.cancelSellOrder(55))
    .revertedWith('Order doesn\'t exist');
    await expect(sellerMarketplace.cancelSellOrder(1))
    .revertedWith('Order must have status open');
    await expect(marketplace.connect(buyer).cancelSellOrder(3))
    .revertedWith('Only original token owner can cancel order');

    // Successful cancel
    await expect(await sellerMarketplace.cancelSellOrder(3))
    .emit(sellerMarketplace, 'SellOrderCancelled')
    .withArgs(collection.address, 1, priceWei, seller.address);

    // Check order updated as expected
    const order = await marketplace.getOrder(3);
    expect(order.price).equal(4000000000000000000n);
    expect(order.createdBy).equal(seller.address);
    expect(order.tokenOwner).equal(seller.address);
    expect(order.collection).equal(collection.address);
    expect(order.token).equal(1);
    expect(order.status).equal(helpers.OrderStatus.cancelled);
    expect(order.ofType).equal(helpers.OrderType.sell);
  });

  it('Makes buy order', async () => {
    // Setup
    const seller = await helpers.user2();
    const buyer = await helpers.user1();
    const secondBuyer = await helpers.user3();
    const buyerMarketplace = marketplace.connect(buyer);
    const priceWei = helpers.ethToWei('5');
    const priceWei2 = helpers.ethToWei('2');

    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);
    await collection.setApprovalForAll(marketplace.address, true);

    expect(await buyerMarketplace.ordersCount()).equal(3);

    // Make buy order
    await expect(await buyerMarketplace.makeBuyOrder(collection.address, 1, {
      value: priceWei
    }))
    .emit(buyerMarketplace, 'BuyOrderCreated')
    .withArgs(collection.address, 1, priceWei, buyer.address);

    // Make another buy order
    await expect(await marketplace.connect(secondBuyer).makeBuyOrder(collection.address, 1, {
      value: priceWei2
    }))
    .emit(buyerMarketplace, 'BuyOrderCreated')
    .withArgs(collection.address, 1, priceWei2, secondBuyer.address);

    expect(await buyerMarketplace.ordersCount()).equal(5);

    // Verify second order
    const order = await marketplace.getOrder(5);
    expect(order.price).equal(priceWei2);
    expect(order.createdBy).equal(secondBuyer.address);
    expect(order.tokenOwner).equal(seller.address);
    expect(order.collection).equal(collection.address);
    expect(order.token).equal(1);
    expect(order.status).equal(helpers.OrderStatus.open);
    expect(order.ofType).equal(helpers.OrderType.buy);

    // Marketplace locked ether
    expect(await marketplace.lockedBalance()).equal(helpers.ethToWei('7.0'));
  });

  it('Tries to make invalid buy order', async () => {
    // Setup
    const seller = await helpers.user2();
    const buyer = await helpers.owner();
    const existingBuyer = await helpers.user1();
    const priceWei = helpers.ethToWei('5');

    const collection = tokenCollectionFactory.attach(await marketplace.collections(1)).connect(seller);
    
    // Try to create buy order for contract that's not part of marketplace
    const emptyContractFactory = await ethers.getContractFactory('EmptyIERC165');
    const emptyContract = await emptyContractFactory.deploy();

    await expect(marketplace.makeBuyOrder(emptyContract.address, 0))
    .revertedWith('Collection must be part of marketplace');

    // Ether not sent with buy order
    await expect(marketplace.connect(buyer).makeBuyOrder(collection.address, 1))
    .revertedWith('Buy bid for token must be above 0');

    // Buy order for non-existing token id
    await expect(marketplace.connect(buyer).makeBuyOrder(collection.address, 55, {
      value: priceWei
    }))
    .revertedWith('ERC721: invalid token ID');

    // Duplicate buy order, same address can't place 2 buy orders
    await expect(marketplace.connect(existingBuyer).makeBuyOrder(collection.address, 1, {
      value: priceWei
    }))
    .revertedWith('Can\'t place buy order twice');
  });

  it('Executes buy order', async () => {
    // Setup
    const seller = await helpers.user2();
    const buyer = await helpers.user1();
    const secondBuyer = await helpers.user3();
    const sellerMarketplace = marketplace.connect(seller);
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1));

    // Invalid execution of buy order
    await expect(sellerMarketplace.executeBuyOrder(55))
    .revertedWith('Order doesn\'t exist');
    await expect(sellerMarketplace.executeBuyOrder(1))
    .revertedWith('Order must have status open');
    await expect(marketplace.connect(buyer).executeBuyOrder(4))
    .revertedWith('Only token owner can execute buy order');

    // Execute buy order
    expect(await marketplace.lockedBalance()).equal(helpers.ethToWei('7.0'));
    await expect(await sellerMarketplace.executeBuyOrder(4))
    .emit(sellerMarketplace, 'BuyOrderExecuted')
    .withArgs(
      collection.address, 1, helpers.ethToWei('5.0'), seller.address,
      4750000000000000000n, 250000000000000000n
    );

    // Previous owner trying to execute buy order
    // But they have already transferred the token 
    await expect(sellerMarketplace.executeBuyOrder(5))
    .revertedWith('Seller must be token owner');

    expect(await marketplace.lockedBalance()).equal(helpers.ethToWei('2.0'));
  });

  it('Cancels buy order', async () => {
    // Setup
    const buyer = await helpers.user3();
    const buyerMarketplace = marketplace.connect(buyer);
    const collection = tokenCollectionFactory.attach(await marketplace.collections(1));

    // Invalid cancel
    await expect(buyerMarketplace.cancelBuyOrder(55))
    .revertedWith('Order doesn\'t exist or sender is not the creator');
    await expect(buyerMarketplace.cancelBuyOrder(4))
    .revertedWith('Order doesn\'t exist or sender is not the creator');

    const balanceBeforeCancel = await buyer.getBalance();
    await expect(await buyerMarketplace.cancelBuyOrder(5))
    .emit(buyerMarketplace, 'BuyOrderCancelled')
    .withArgs(
      collection.address, 1, helpers.ethToWei('2.0'), buyer.address
    );

    expect(await marketplace.lockedBalance()).equal(0);
    const newAddressBalance = await buyer.getBalance();
    expect(newAddressBalance).above(balanceBeforeCancel);
  });

  it('Get has collection and order boudries', async () => {
    await expect(marketplace.getOrder(55))
    .revertedWith('Index must be: 0 < _id <= ordersCount');

    await expect(marketplace.getCollection(55))
    .revertedWith('Index must be: 0 < _id <= collectionsCount');
  });

  it('Withdraws fees', async () => {
    const owner = await helpers.owner();
    const nonOwner = await helpers.user2();
    const amount = helpers.ethToWei('0.1');
    const marketBalance = await marketplace.balance();
    await expect(await marketplace.withdraw(owner.address, amount))
    .emit(marketplace, 'FeesWithdrawn')
    .withArgs(owner.address, amount);

    // Invalid
    await expect(marketplace.withdraw(owner.address, marketBalance))
    .revertedWith('Amount must be lte to balance');
    await expect(marketplace.connect(nonOwner).withdraw(owner.address, amount))
    .revertedWith('Ownable: caller is not the owner'); 
  });
});