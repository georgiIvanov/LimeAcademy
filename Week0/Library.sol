// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

struct Book {
    string name;
    uint16 copies;
}

contract Library is Ownable {
    mapping (uint => bool) hashToBookExists;
    mapping (uint => Book) indexToBooks;
    mapping (uint => uint) hashToBookIndex;
    uint public totalBooks = 0;
    mapping (address => uint[]) borrowedByUsers;

    event BookUpdated(Book book);
    event BookAdded(Book book);
    event BookBorrowed(Book book);

    function addBook(Book memory _book) onlyOwner public {
        require(_book.copies > 0, "Book should have at least one copy.");
        require(bytes(_book.name).length > 0, "Book must have a name.");
        uint bookHash = calculateBookHash(_book.name);
        
        require(hashToBookExists[bookHash] == false, "Book is already in library.");
        indexToBooks[totalBooks] = _book;
        hashToBookIndex[bookHash] = totalBooks;
        hashToBookExists[bookHash] = true;
        totalBooks++;
        emit BookAdded(_book);
    }

    function updateCopies(string memory _bookName, uint16 _newCopiesValue) onlyOwner public {
        uint bookHash = calculateBookHash(_bookName);

        require(hashToBookExists[bookHash], "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        Book storage book = indexToBooks[index];
        book.copies = _newCopiesValue;
        emit BookUpdated(book);
    }

    function borrowBook(string memory _bookName) public {
        uint bookHash = calculateBookHash(_bookName);

        require(hashToBookExists[bookHash], "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        Book storage book = indexToBooks[index];

        require(book.copies > 0, "No more copies left in library.");
        uint[] memory borrowedIndices = borrowedByUsers[msg.sender];

        require(bookIsBorrowed(borrowedIndices, index) == false, "Same book cannot be borrowed twice.");
        book.copies--;
        borrowedByUsers[msg.sender].push(index);
        emit BookBorrowed(book);
    }

    function getBook(uint _index) external view returns (Book memory) {
        Book memory result = indexToBooks[_index];
        return result;
    }

    function allBooks() external view returns(Book[] memory) {
        uint totalCount = totalBooks;
        Book[] memory books = new Book[](totalCount);

        for (uint i = 0; i < totalCount; i++) {
            books[i] = indexToBooks[i];
        }
        return books;
    }

    function calculateBookHash(string memory _bookName) internal pure returns(uint) {
        bytes32 val = sha256(abi.encodePacked(_bookName));
        return uint(val);
    }

    function bookIsBorrowed(uint[] memory _userBorrowedBooksIndices, uint bookIndex) internal pure returns(bool) {
        for (uint i = 0; i < _userBorrowedBooksIndices.length; i++) {
            if (_userBorrowedBooksIndices[i] == bookIndex) {
                return true;
            }
        }

        return false;
    }
}