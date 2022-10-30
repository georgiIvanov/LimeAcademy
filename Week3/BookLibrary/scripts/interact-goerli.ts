import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BookLibrary, BookLibrary__factory } from '../typechain-types';

export const georliRun = async (hre: HardhatRuntimeEnvironment) => {
  const provider = new hre.ethers.providers.InfuraProvider('goerli', {
    infura: process.env.INFURA_API_KEY
  });

  const latestBlock = await provider.getBlock('latest');
  console.log('Latest block: ' + latestBlock.hash);

  const wallet = new hre.ethers.Wallet(
    process.env.GOERLI_PRIVATE_KEY as string,
    provider
  );

  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance));

  const contractAddress = "0x397cCa7507F22973Fc9C8B0525570A0a605A3622";
  const bookLibrary = new hre.ethers.Contract(contractAddress, BookLibrary__factory.abi, wallet) as BookLibrary;

  var receipt = await bookLibrary.addBook({name: 'Some book', copies: 10});
  if ((await receipt.wait()).status == 1) {
    console.log('Some book was added to ', contractAddress);
  } 
  
  receipt = await bookLibrary.borrowBook('Some book');
  if ((await receipt.wait()).status == 1) {
    console.log('Some book borrowed');
  } 

  let first20Books = await bookLibrary.allBooks(0);
  console.log('All books: ');
  first20Books.forEach(element => {
    console.log('name:', element.name, ', copies:', element.copies);
  });
  
  var borrowedByOwner = await bookLibrary.bookIsBorroweByUser('Some book', wallet.address);
  console.log('Some Book is borrowed by ' + wallet.address + ': ' + borrowedByOwner);

  receipt = await bookLibrary.returnBook('Some book');
  if ((await receipt.wait()).status == 1) {
    console.log('Successfully returned Some book');
  }

  borrowedByOwner = await bookLibrary.bookIsBorroweByUser('Some book', wallet.address);
  console.log('Some Book is borrowed by ' + wallet.address + ': ' + borrowedByOwner);
};