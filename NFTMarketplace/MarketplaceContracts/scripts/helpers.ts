import { ethers } from 'hardhat';

export let owner = async () => {
  return (await ethers.getSigners())[0];
}

export let user1 = async () => {
  return (await ethers.getSigners())[1];
}

export let user2 = async () => {
  return (await ethers.getSigners())[2];
}

export let user3 = async () => {
  return (await ethers.getSigners())[3];
}

export let ethToWei = (amount: string) => {
  return ethers.utils.parseUnits(amount, 'ether');
}

export let weiToEth = (amount: string | number | any) => {
  return ethers.utils.formatEther(amount);
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
