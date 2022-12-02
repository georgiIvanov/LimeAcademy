import { expect } from 'chai';
import { ethers } from 'hardhat';
import { 
  Marketplace, Marketplace__factory,
} from '../typechain-types';
import * as helpers from './../scripts/helpers';

describe('Marketplace', () => {
  let marketplaceFactory: Marketplace__factory;
  let marketplace: Marketplace;

  before(async () => {
    marketplaceFactory = await ethers.getContractFactory('Marketplace');
    marketplace = await marketplaceFactory.deploy();
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
      'Collection1', 'C1', 'First collection', 'baseUri.com'
    );

    expect(await marketplace.collectionsCount()).equal(1);
  });

  it('Add collection', async () => {
    const tokenCollectionFactory = await ethers.getContractFactory('TokenCollection');
    const tokenCollection = await tokenCollectionFactory.deploy(
      'Collection2', 'C2', 'Second collection', 'baseUriC2.com'
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
  
});