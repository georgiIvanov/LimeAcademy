import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BookLibrary, BookLibrary__factory } from '../typechain-types';


export const hardhatRun = async (hre: HardhatRuntimeEnvironment) => {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
  const wallet = new hre.ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );

  // Replace address
  const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
  const bookLibrary = new hre.ethers.Contract(contractAddress, BookLibrary__factory.abi, wallet) as BookLibrary;

  await bookLibrary.addBook({name: 'Some book', copies: 10});
  await bookLibrary.borrowBook('Some book');

  let first20Books = await bookLibrary.allBooks(0);
  console.log('All books: ');
  first20Books.forEach(element => {
    console.log('name:', element.name, ', copies:', element.copies);
  });

  var borrowedByOwner = await bookLibrary.bookIsBorrowedByUser('Some book', wallet.address);
  console.log('Some Book is borrowed by ' + wallet.address + ': ' + borrowedByOwner);

  const returnTransaction = await bookLibrary.returnBook('Some book');
  const returnReceipt = await returnTransaction.wait();
  if (returnReceipt.status == 1) {
    console.log('Successfully returned Some book');
  }

  borrowedByOwner = await bookLibrary.bookIsBorrowedByUser('Some book', wallet.address);
  console.log('Some Book is borrowed by ' + wallet.address + ': ' + borrowedByOwner);
};