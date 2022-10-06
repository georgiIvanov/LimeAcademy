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

    event BookAdded(Book book);

    function addBook(Book memory _book) onlyOwner public {
        require(_book.copies > 0, "Book should have at least one copy.");
        require(bytes(_book.name).length > 0, "Book must have a name.");
        uint bookHash = calculateBookHash(_book);
        require(hashToBookExists[bookHash] == false, "Book is already in library.");

        indexToBooks[totalBooks] = _book;
        hashToBookIndex[bookHash] = totalBooks;
        hashToBookExists[bookHash] = true;
        totalBooks++;
        emit BookAdded(_book);
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

    function calculateBookHash(Book memory _book) internal pure returns(uint) {
        bytes32 val = sha256(abi.encodePacked(_book.name));
        return uint(val);
    }
}
