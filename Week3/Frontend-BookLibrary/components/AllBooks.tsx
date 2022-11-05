import { useEffect } from "react"
import { BookLibrary } from "../contracts/types/BookLibrary"
import { BookLibraryState } from "./BookLibrary"

export interface AllBooksProps {
  bookLibraryContract: BookLibrary
  state: BookLibraryState
  setState: (state: BookLibraryState) => void
}

export const AllBooks = ({bookLibraryContract, state, setState}: AllBooksProps): JSX.Element =>  {
  useEffect(() => {
    if (state.totalBooks != 0) {
      getAllBooks();
    }
  }, [state.totalBooks]);

  const getAllBooks = async () => {
    const books = await bookLibraryContract.allBooks(0);
    setState({...state, books: books});
  };
  
  return (
    <div>
      <ul className="list-disc">
        {
          state.books.map((book, index) => {
            console.log(book);
            let foo = index % 2 == 0 ? 'bg-blue': '';
            return <li>{book.name}</li>
          })
        }
      </ul>
    </div>
  )
  // return <div>foo</div>
}