// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

struct Book {
    string name;
    uint16 copies;
}

struct BorrowHistory {
    uint borrowsIndex;
    mapping(uint => address) indexToUser;
}

contract BookLibrary is Ownable {
    mapping (uint => bool) hashToBookExists;
    mapping (uint => Book) indexToBooks;
    mapping (uint => uint) hashToBookIndex;
    uint public totalBooks = 0;
    uint public constant pageSize = 20; 

    // User address -> Book index -> isBorrowed
    mapping (address => mapping (uint => bool)) borrowedByUsers;
    // Book index -> BorrowHistory
    mapping (uint => BorrowHistory) bookIndexToBorrowHistory;

    event BookUpdated(Book book);
    event BookAdded(Book book);
    event BookBorrowed(Book book);
    event BookReturned(Book book);

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

        require(bookIsBorrowed(msg.sender, index) == false, "Same book cannot be borrowed twice.");
        book.copies--;
        borrowedByUsers[msg.sender][index] = true;
        
        BorrowHistory storage history = bookIndexToBorrowHistory[index];
        history.indexToUser[history.borrowsIndex] = msg.sender;
        history.borrowsIndex++;

        emit BookBorrowed(book);
    }

    function returnBook(string memory _bookName) public {
        uint bookHash = calculateBookHash(_bookName);

        require(hashToBookExists[bookHash], "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        
        require(bookIsBorrowed(msg.sender, index), "Cannot return a book that's not borrowed.");
        Book storage book = indexToBooks[index];
        book.copies++;
        removeFromBorrowedByUsers(msg.sender, index);
        emit BookReturned(book);
    }

    function removeFromBorrowedByUsers(address _user, uint _bookIndex) internal {
        borrowedByUsers[_user][_bookIndex] = false;
    }

    // Returns a maximum of 20 users that have borrowed book with this name.
    function borrowHistory(string memory _bookName, uint _offset) public view returns (address[] memory) {
        uint bookHash = calculateBookHash(_bookName);
        require(hashToBookExists[bookHash], "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        BorrowHistory storage history = bookIndexToBorrowHistory[index];
        require(_offset < history.borrowsIndex, 'Offset should be less than amount of borrowed books.');

        uint start = _offset;
        uint end = _offset + pageSize;
        end = min(end, history.borrowsIndex - 1);
        uint arraySize = min(end - start + 1, pageSize);
        address[] memory userBorrowHistory = new address[](arraySize);
        for (uint i = 0; i < arraySize; i++) {
            userBorrowHistory[i] = history.indexToUser[start];
            start++;
        }
        
        return userBorrowHistory;
    }

    function getBook(uint _index) external view returns (Book memory) {
        Book memory result = indexToBooks[_index];
        return result;
    }

    // Returns a maximum of 20 books
    function allBooks(uint _offset) external view returns(Book[] memory) {
        if (totalBooks == 0) {
            return new Book[](0);
        }
        
        uint start = _offset;
        uint end = _offset + pageSize;
        end = min(end, totalBooks - 1);
        uint arraySize = min(end - start + 1, pageSize);
        Book[] memory books = new Book[](arraySize);

        for (uint i = 0; i < arraySize; i++) {
            books[i] = indexToBooks[start];
            start++;
        }

        return books;
    }

    function calculateBookHash(string memory _bookName) internal pure returns(uint) {
        bytes32 val = sha256(abi.encodePacked(_bookName));
        return uint(val);
    }

    function bookIsBorrowed(address user, uint bookIndex) internal view returns(bool) {
        return borrowedByUsers[user][bookIndex];
    }

    function bookIsBorrowedByUser(string memory _bookName, address _user) public view returns(bool) {
        uint bookHash = calculateBookHash(_bookName);
        require(hashToBookExists[bookHash], "Book is not in library.");
        uint index = hashToBookIndex[bookHash];
        return borrowedByUsers[_user][index];
    }

    function min(uint a, uint b) public pure returns (uint) {
        return a >= b ? b : a;
    }
}