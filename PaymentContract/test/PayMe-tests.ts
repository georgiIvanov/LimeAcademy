import { expect } from "chai";
import { ethers } from "hardhat";
import { PayMe, PayMe__factory } from '../typechain-types';
import * as helpers from './../scripts/helpers';

describe("PayMe", () => {
  let payMeFactory: PayMe__factory;
  let payMe: PayMe;

  beforeEach(async () => {
    payMeFactory = await ethers.getContractFactory('PayMe');
    payMe = await payMeFactory.deploy();
  });

  it('Should initialize', async () => {
    expect(await payMe.balance()).equal(0);
  });

  it('Should receive simple payment and withdraw', async () => {
    let payValue = helpers.ethToWei('0.01');

    await expect(payMe.simplePay({ value: payValue }))
    .to.emit(payMe, 'PaymentReceived');

    expect(await payMe.balance()).equal(payValue);
    await payMe.withdraw();
    expect(await payMe.balance()).equal(0);
  });

  it('Should receive payment for item', async () => {
    let payValue = helpers.ethToWei('0.01');
    await expect(payMe.payFor(15,{ value: payValue }))
    .to.emit(payMe, 'PaymentForItemReceived')
    .withArgs(15);
    expect(await payMe.balance()).equal(payValue);    
  });

  it('Should receive batch item payment', async () => {
    let payValue = helpers.ethToWei('0.01');
    await expect(payMe.batchPayment([3, 5, 7] ,{ value: payValue }))
    .to.emit(payMe, 'BatchPaymentReceived')
    .withArgs([3, 5, 7], payValue);
    expect(await payMe.balance()).equal(payValue);   
  });

  it('Should receive insufficient batch item payment', async () => {
    let payValue = helpers.ethToWei('0.0001');
    await expect(payMe.batchPayment([3, 5, 7], { value: payValue }))
    .to.be.revertedWithCustomError(payMe, 'PaymentAmountNotEnough')
    .withArgs([3, 5, 7], payValue);
    expect(await payMe.balance()).equal(0);
  });
});
