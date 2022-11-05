import { ChangeEvent, useState } from "react";
import { BookLibrary } from "../contracts/types/BookLibrary";
import { BookLibraryState } from "./BookLibrary";
import { Spinner } from "./Spinner";

export interface AddBookProps {
  bookLibraryContract: BookLibrary
  state: BookLibraryState
  setState: (state: BookLibraryState) => void
}

export const AddBook = ({ bookLibraryContract, state, setState }: AddBookProps): JSX.Element => {
  const [bookName, setBookName] = useState<string>('');
  const [bookCopies, setBookCopies] = useState<number>(5);
  const [addBookSpinner, setAddBookSpinner] = useState<boolean>(false);

  const bookNameInput = (input: ChangeEvent<HTMLInputElement>) => {
    setBookName(input.target.value);
  }

  const bookCopiesInput = (input: ChangeEvent<HTMLInputElement>) => {
    setBookCopies(Number(input.target.value));
  }

  const addBook = async () => {
    setAddBookSpinner(true);
    try {
      let tx = await bookLibraryContract.addBook({ name: bookName, copies: bookCopies });
      console.log(tx);
      await tx.wait();
      state.totalBooks = await bookLibraryContract.totalBooks();
      setState(state);
    } finally {
      setAddBookSpinner(false);
      clearBookForm();
    }
  }

  const clearBookForm = () => {
    setBookName('');
    setBookCopies(5);
  }

  return <div className="space-y-2">
    <label className="block">
      <span className="block required text-sm font-medium text-slate-700">Name</span>
      <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        onChange={bookNameInput} value={bookName}
      />
    </label>
    <label className="block">
      <span className="block required text-sm font-medium text-slate-700">Copies</span>
      <input type="number" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        onChange={bookCopiesInput} value={bookCopies}
      />
    </label>
    <span className="flex h-8 space-x-6">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        onClick={addBook}>
        Add book
      </button>
      {addBookSpinner && <Spinner />}
    </span>
  </div>
}

