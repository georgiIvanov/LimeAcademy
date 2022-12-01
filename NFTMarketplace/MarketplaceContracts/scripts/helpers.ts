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

export let ethToWei = (amount: string) => {
  return ethers.utils.parseUnits(amount, 'ether');
}

export let weiToEth = (amount: string | number) => {
  return ethers.utils.formatEther(amount);
}