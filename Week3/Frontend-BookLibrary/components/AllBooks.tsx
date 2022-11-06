import { useEffect, useState } from "react"
import { BookLibrary, BookStruct } from "../contracts/types/BookLibrary"
import { ActionButton } from "./ActionButton"
import { BookLibraryState } from "./BookLibrary"
import { Spinner } from "./Spinner"

export interface AllBooksProps {
  bookLibraryContract: BookLibrary
  state: BookLibraryState
  setState: (state: BookLibraryState) => void
}

export const AllBooks = ({ bookLibraryContract, state, setState }: AllBooksProps): JSX.Element => {
  const [borrowIndex, setBorrowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (state.totalBooks != 0) {
      setBorrowIndex(null);
      getAllBooks();
    }
  }, [state.totalBooks.toString(), state.connectedWalletAddress]);

  const getAllBooks = async () => {
    const books = await bookLibraryContract.allBooks(0);
    const borrowed = await findBorrowedBooksIndices(books);
    setState({ ...state, books: books, borrowed: borrowed });
  };

  const borrowBook = async (bookName: string, index: number) => {
    if (borrowIndex != null) {
      return;
    }
    
    setBorrowIndex(index);
    try {
      const tx = await bookLibraryContract.borrowBook(bookName);
      await tx.wait();
      await getAllBooks();
    } finally {
      setBorrowIndex(null);
    }
  };

  const findBorrowedBooksIndices = async (books: BookStruct[]): Promise<number[]> => {
    const result = books.flatMap(async (book, index) => {
      return (await bookLibraryContract.bookIsBorrowedByUser(book.name, state.connectedWalletAddress))
      ? index
      : null;
    })

    return await Promise.all(result);
  }

  const returnBook = async (bookName: string, index: number) => {
    setBorrowIndex(index);
    try {
      const tx = await bookLibraryContract.returnBook(bookName);
      await tx.wait();
      await getAllBooks();
    } finally {
      setBorrowIndex(null);
    }
  }

  return (
    <div>
      <ul>
        {
          state.books.map((book, index) => {
            let rowBackground = index % 2 == 0 ? 'bg-gray-200' : 'bg-gray-300';
            
            let actionButton = state.borrowed[index] == null 
            ? <ActionButton title="Borrow" onClick={ () => { borrowBook(book.name, index) }} />
            : <ActionButton title="Return" onClick={ () => { returnBook(book.name, index) }} />

            let borrowElement = borrowIndex == index 
            ? <Spinner /> 
            : actionButton
            return (<li className={'px-2 py-2 flow-root ' + rowBackground}>
              <span className="float-left">{book.name} ({book.copies})</span>
              
              <span className="float-right">
                {borrowElement}
              </span>
              
            </li>)
          })
        }
      </ul>
    </div>
  )
}