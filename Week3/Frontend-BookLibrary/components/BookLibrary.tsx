import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumberish } from "ethers";
import { useEffect, useState } from "react";
import { BOOKLIBRARY_ADDRESS } from "../constants";
import { BookStruct } from "../contracts/types/BookLibrary";
import useBookLibraryContract from "../hooks/useBookContract";
import { AddBook } from "./AddBook";
import { AllBooks } from "./AllBooks";

export class BookLibraryState {
  libraryOwner: string;
  connectedWalletAddress: string;
  books: BookStruct[]
  borrowed: number[]
  totalBooks: BigNumberish;
  isOwner: boolean;

  constructor() {
    this.libraryOwner = '';
    this.connectedWalletAddress = '';
    this.books = Array<BookStruct>();
    this.borrowed = Array<number>();
    this.totalBooks = 0;
    this.isOwner = false;
  }
}

export const BookLibrary = (): JSX.Element => {
  const bookLibraryContract = useBookLibraryContract(BOOKLIBRARY_ADDRESS);
  const { account } = useWeb3React<Web3Provider>();
  const [state, setState] = useState<BookLibraryState>(new BookLibraryState())

  useEffect(() => {
    getBookLibraryInfo();
  }, [account]);

  const getBookLibraryInfo = async () => {
    const libraryOwner = await bookLibraryContract.owner();
    const totalBooks = await bookLibraryContract.totalBooks();
    state.libraryOwner = libraryOwner;
    state.connectedWalletAddress = account;
    state.totalBooks = totalBooks;
    const newState = {
      ...state, 
      libraryOwner: libraryOwner, 
      connectedWalletAddress: account, 
      totalBooks: totalBooks,
      isOwner: libraryOwner === account
    } as BookLibraryState;
    setState(newState);
  };

  return (
    <div className="grid grid-cols-2 w-1/2">
      <div className="px-2 py-2">
        <div className="grid grid-cols-1 gap-4">
          <AddBook bookLibraryContract={bookLibraryContract} state={state} setState={setState} />
        </div>
      </div>
      <div className="px-2 py-2">
        <AllBooks bookLibraryContract={bookLibraryContract} state={state} setState={setState} />
      </div>
    </div>
  );
};