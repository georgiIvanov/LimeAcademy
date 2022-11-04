import BookLibrary_Abi from "../contracts/BookLibrary.json";
import { BookLibrary } from "../contracts/types/BookLibrary";
import useContract from "./useContract";

export default function useBookLibraryContract(contractAddress?: string) {
  return useContract<BookLibrary>(contractAddress, BookLibrary_Abi);
}
