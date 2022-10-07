// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

struct Book {
    string name;
    uint16 copies;
}

contract Library is Ownable {
    mapping (uint => Book) indexToBooks;
    mapping (uint => uint) hashToBookIndex;
    uint public totalBooks = 0;
    mapping (address => uint[]) borrowedByUsers;
    mapping (uint => address[]) bookIndexToBorrowHistory;

    event BookUpdated(Book book);
    event BookAdded(Book book);
    event BookBorrowed(Book book);
    event BookReturned(Book book);

    function addBook(Book memory _book) onlyOwner public {
        require(_book.copies > 0, "Book should have at least one copy.");
        require(bytes(_book.name).length > 0, "Book must have a name.");
        uint bookHash = calculateBookHash(_book.name);
        
        require(bookExists(bookHash) == false, "Book is already in library.");
        indexToBooks[totalBooks] = _book;
        hashToBookIndex[bookHash] = totalBooks;
        totalBooks++;
        emit BookAdded(_book);
    }

    function updateCopies(string memory _bookName, uint16 _newCopiesValue) onlyOwner public {
        uint bookHash = calculateBookHash(_bookName);

        require(bookExists(bookHash), "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        Book storage book = indexToBooks[index];
        book.copies = _newCopiesValue;
        emit BookUpdated(book);
    }

    function borrowBook(string memory _bookName) public {
        uint bookHash = calculateBookHash(_bookName);

        require(bookExists(bookHash), "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        Book storage book = indexToBooks[index];

        require(book.copies > 0, "No more copies left in library.");
        uint[] memory borrowedIndices = borrowedByUsers[msg.sender];

        require(bookIsBorrowed(borrowedIndices, index) == false, "Same book cannot be borrowed twice.");
        book.copies--;
        borrowedByUsers[msg.sender].push(index);
        bookIndexToBorrowHistory[index].push(msg.sender);
        emit BookBorrowed(book);
    }

    function returnBook(string memory _bookName) public {
        uint bookHash = calculateBookHash(_bookName);

        require(bookExists(bookHash), "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        uint[] storage borrowedIndices = borrowedByUsers[msg.sender];
        
        require(bookIsBorrowed(borrowedIndices, index), "Cannot return a book that's not borrowed.");
        Book storage book = indexToBooks[index];
        book.copies++;
        removeFromBorrowedByUsers(borrowedIndices, index);
        emit BookReturned(book);
    }

    function removeFromBorrowedByUsers(uint[] storage _borrowedByUser, uint _bookIndex) internal {
        for(uint i = 0; i < _borrowedByUser.length; i++) {
            if(_borrowedByUser[i] == _bookIndex) {
                _borrowedByUser[i] = _borrowedByUser[_borrowedByUser.length - 1];
                _borrowedByUser.pop();
                break;
            }
        }
    }

    function borrowHistory(string memory _bookName) public returns (address[] memory) {
        uint bookHash = calculateBookHash(_bookName);
        require(bookExists(bookHash), "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        return bookIndexToBorrowHistory[index];
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

    event Log(uint value);
    function bookExists(uint bookHash) internal returns(bool) {
        uint index = hashToBookIndex[bookHash];
        emit Log(bookHash);
        emit Log(index);
        bytes memory nameBytes = bytes(indexToBooks[index].name);
        return nameBytes.length > 0;
    }
}