import { HardhatEthersHelpers } from "hardhat/types";
import { PayMe } from "../typechain-types";
import * as helpers from './helpers';

export async function payMeInteract(ethers: HardhatEthersHelpers) {
  const owner = await helpers.owner(ethers);
  const user1 = await helpers.user1(ethers);
  console.log(' --- Interact script ---- ');
  console.log('Signer ', owner.address);
  
  const payMeFactory = await ethers.getContractFactory('PayMe');
  const payMe = await payMeFactory.deploy();
  console.log("PayMe contract deployed to:", payMe.address);

  let tx = await payMe.simplePay({value: helpers.ethToWei('0.01')});
  await tx.wait();

  console.log('PayMe balance:', await payMe.balance());

  await payMe.withdraw();

  console.log('PayMe balance after withdraw:', await payMe.balance());

  console.log('-Batch payment-');
  tx = await payMe.batchPayment([1, 2, 3], {value: helpers.ethToWei('0.0002')});
  await tx.wait();

  console.log('Balance after batch payment:', await payMe.balance());
}
