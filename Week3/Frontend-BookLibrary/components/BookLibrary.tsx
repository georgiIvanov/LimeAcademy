import { ChangeEvent, useState } from "react";
import { BOOKLIBRARY_ADDRESS } from "../constants";
import useBookLibraryContract from "../hooks/useBookContract";
import { AddBook } from "./AddBook";
import { Spinner } from "./Spinner";

export interface BookLibraryProps {

}

export const BookLibrary = ({ }: BookLibraryProps): JSX.Element => {
  const bookLibraryContract = useBookLibraryContract(BOOKLIBRARY_ADDRESS);
  

  return (
    <div className="w-1/4 px-2">
      <div className="grid grid-cols-1 gap-4">
        <AddBook bookLibraryContract={bookLibraryContract} />
      </div>
    </div>
  );
};