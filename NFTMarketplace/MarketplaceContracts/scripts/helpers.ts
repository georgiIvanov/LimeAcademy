import { HardhatEthersHelpers } from "hardhat/types";
import { utils } from 'ethers';

export let owner = async (ethers: HardhatEthersHelpers) => {
  return (await ethers.getSigners())[0];
}

export let user1 = async (ethers: HardhatEthersHelpers) => {
  return (await ethers.getSigners())[1];
}

export let user2 = async (ethers: HardhatEthersHelpers) => {
  return (await ethers.getSigners())[2];
}

export let user3 = async (ethers: HardhatEthersHelpers) => {
  return (await ethers.getSigners())[3];
}

export let ethToWei = (amount: string) => {
  return utils.parseUnits(amount, 'ether');
}

export let weiToEth = (ethers: HardhatEthersHelpers, amount: string | number | any) => {
  return utils.formatEther(amount);
}

export enum OrderStatus {
  open,
  executed,
  cancelled
}

export enum OrderType {
  sell,
  buy
}
