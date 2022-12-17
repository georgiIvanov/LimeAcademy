import { expect } from 'chai';
import { ethers } from 'hardhat';
import { TokenCollection, TokenCollection__factory } from '../typechain-types';
import * as helpers from './../scripts/helpers';

describe('TokenCollection', () => {
  let tokenCollectionFactory: TokenCollection__factory;
  let tokenCollection: TokenCollection;

  beforeEach(async () => {
    tokenCollectionFactory = await ethers.getContractFactory('TokenCollection');
    tokenCollection = await tokenCollectionFactory.deploy(
      'TKN', 'https://base.url.com/', 'Token', 'Some description'
    );
  });

  it('Should initialize', async () => {
    expect(await tokenCollection.symbol()).equal('TKN');
    expect(await tokenCollection.name()).equal('Token');
    expect(await tokenCollection.baseUri()).equal('https://base.url.com/');
    expect(await tokenCollection.description()).equal('Some description');
  });

  it('Should mint', async () => {
    const user = await helpers.user1(ethers);
    await tokenCollection.mint(user.address, 'hash123');
    const tokenUri = await tokenCollection.tokenURI(0);
    expect(tokenUri).equal('https://base.url.com/hash123');
    expect(await tokenCollection.ownerOf(0)).equal(user.address);
  });

  it('Should transfer via approved', async () => {
    const user1 = await helpers.user1(ethers);
    const user2 = await helpers.user2(ethers);
    const user3 = await helpers.user3(ethers);
    await expect(await tokenCollection.mint(user1.address, 'hash123'))
    .emit(tokenCollection, 'TokenMinted')
    .withArgs(0, user1.address, (await helpers.owner(ethers)).address);

    const user1Collection = tokenCollection.connect(user1);
    await user1Collection.approve(user2.address, 0);
    expect(await tokenCollection.getApproved(0)).equal(user2.address);

    const user2Collection = tokenCollection.connect(user2);
    await user2Collection.transferFrom(user1.address, user3.address, 0);
    expect(await tokenCollection.ownerOf(0), user3.address);
    expect(await tokenCollection.getApproved(0)).equal('0x0000000000000000000000000000000000000000');
  });
});