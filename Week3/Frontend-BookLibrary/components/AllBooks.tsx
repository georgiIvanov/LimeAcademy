import { useEffect } from "react"
import { BookLibrary } from "../contracts/types/BookLibrary"
import { ActionButton } from "./ActionButton"
import { BookLibraryState } from "./BookLibrary"

export interface AllBooksProps {
  bookLibraryContract: BookLibrary
  state: BookLibraryState
  setState: (state: BookLibraryState) => void
}

export const AllBooks = ({ bookLibraryContract, state, setState }: AllBooksProps): JSX.Element => {
  useEffect(() => {
    if (state.totalBooks != 0) {
      getAllBooks();
    }
  }, [state.totalBooks]);

  const getAllBooks = async () => {
    const books = await bookLibraryContract.allBooks(0);
    setState({ ...state, books: books });
  };

  return (
    <div>
      <ul>
        {
          state.books.map((book, index) => {
            let foo = index % 2 == 0 ? 'bg-gray-200' : 'bg-gray-300';
            return <li className={'px-2 py-2 flow-root ' + foo}>
              <span className="float-left">{book.name}</span>
              <span className="float-right">
                <ActionButton title="Borrow" onClick={ () => {} } />
              </span>
            </li>
          })
        }
      </ul>
    </div>
  )
  // return <div>foo</div>
}