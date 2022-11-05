import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, BigNumberish } from "ethers";
import { ChangeEvent, useEffect, useState } from "react";
import { BOOKLIBRARY_ADDRESS } from "../constants";
import { BookStruct } from "../contracts/types/BookLibrary";
import useBookLibraryContract from "../hooks/useBookContract";
import { AddBook } from "./AddBook";
import { AllBooks } from "./AllBooks";
import { Spinner } from "./Spinner";

export class BookLibraryState {
  libraryOwner: string;
  connectedWalletAddress: string;
  books: BookStruct[]
  totalBooks: BigNumberish;

  constructor() {
    this.libraryOwner = '';
    this.connectedWalletAddress = '';
    this.books = Array<BookStruct>();
    this.totalBooks = 0;
  }

  isOwner = () => {
    return this.libraryOwner == this.connectedWalletAddress 
    && this.libraryOwner.length != 0
    && this.libraryOwner != null;
  }
}

export const BookLibrary = (): JSX.Element => {
  const bookLibraryContract = useBookLibraryContract(BOOKLIBRARY_ADDRESS);
  const { account, library } = useWeb3React<Web3Provider>();
  const [state, setState] = useState<BookLibraryState>(new BookLibraryState())
  
  useEffect(() => {
    getBookLibraryInfo();
  }, []);

  const getBookLibraryInfo = async () => {
    const libraryOwner = await bookLibraryContract.owner();
    const totalBooks = await bookLibraryContract.totalBooks();
    setState({
      ...state, 
      libraryOwner: libraryOwner, 
      totalBooks: totalBooks, 
      connectedWalletAddress: account
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="w-1/4 px-2">
        <div className="grid grid-cols-1 gap-4">
          <AddBook bookLibraryContract={bookLibraryContract} state={state} setState={setState} />
        </div>
      </div>
      <div className="w-1/4 px-2">
        <AllBooks bookLibraryContract={bookLibraryContract} state={state} setState={setState} />
      </div>
    </div>
  );
};