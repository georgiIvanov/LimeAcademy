import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BookLibrary, BookLibrary__factory } from '../typechain-types';
import * as helpers from './TestHelpers';

describe('BookLibrary usage', () => {
  let bookLibraryFactory: BookLibrary__factory;
  let bookLibrary: BookLibrary;

  before( async () => {    
    bookLibraryFactory = await ethers.getContractFactory('BookLibrary');
    bookLibrary = await bookLibraryFactory.deploy();
  });

  it('Should have expected initial state', async () => {
    expect(await bookLibrary.totalBooks()).to.equal(0);
    expect(await bookLibrary.allBooks(0)).be.empty;
  });

  it('Owner adds a book', async () => {    
    bookLibrary.addBook({name: "Some book", copies: 10});
    expect(await bookLibrary.totalBooks()).to.equal(1);
  });

  it('Owner tries to add invalid book', async () => {
    await expect(bookLibrary.addBook({name: "Some book", copies: 0}))
    .to.be.revertedWith('Book should have at least one copy.');
    expect(await bookLibrary.totalBooks()).to.equal(1);

    bookLibrary.addBook({name: "", copies: 10});
    expect(await bookLibrary.totalBooks()).to.equal(1);

    await expect(bookLibrary.addBook({name: "Some book", copies: 5}))
    .to.be.revertedWith('Book is already in library.');
  });

  it('User tries to add a book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.addBook({name: "User's book", copies: 10}))
    .to.be.revertedWith('Ownable: caller is not the owner');
    expect(await bookLibrary.totalBooks()).to.equal(1);
  });

  it('Owner updates a book', async () => {
    await expect(bookLibrary.updateCopies('Some book', 5))
    .to.emit(bookLibrary, "BookUpdated")
    .withArgs(['Some book', 5]);
    
    expect(await bookLibrary.totalBooks()).to.equal(1);

    let value = await bookLibrary.getBook(0);    
    expect(value.name).to.equal('Some book');
    expect(value.copies).to.equal(5);

    // Why doesn't this assertion work?
    // AssertionError: expected [ 'Some book', 5 ] to equal [ 'Some book', 5 ]
    // expect([value[0], value[1]]).to.equal(['Some book', 5]);
    
    // console.log(await bookLibrary.getBook(0)); output is ->
    //[ 'Some book', 5, name: 'Some book', copies: 5 ]
  });

  it('Owner tries to update unexisting book', async () => {
    await expect(bookLibrary.updateCopies('Unexisting', 5))
    .to.revertedWith('Book is not in library.');
  });

  it('User tries to update book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.updateCopies('Some book', 99))
    .to.revertedWith('Ownable: caller is not the owner');
  });

  it('Borrows book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.borrowBook('Some book'))
    .to.emit(userLibrary, 'BookBorrowed')
    .withArgs(['Some book', 4]);
  });

  it('Returns book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.returnBook('Some book'))
    .to.emit(userLibrary, 'BookReturned')
    .withArgs(['Some book', 5]);
  });

  it('Tries to borrow unexisting book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.borrowBook('Invalid book'))
    .to.be.revertedWith('Book is not in library.');
  });

  it('Tries to borrow book twice', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.borrowBook('Some book'))
    .to.emit(userLibrary, 'BookBorrowed')
    .withArgs(['Some book', 4]);

    await expect(userLibrary.borrowBook('Some book'))
    .to.be.revertedWith('Same book cannot be borrowed twice.');
  });

  it('Tries to borrow book when no copies', async () => {
    await bookLibrary.addBook({name: "Few copies", copies: 1});

    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.borrowBook('Few copies'))
    .to.emit(userLibrary, 'BookBorrowed')
    .withArgs(['Few copies', 0]);

    let secondUserLibrary = bookLibrary.connect(await helpers.user2());
    await expect(secondUserLibrary.borrowBook('Few copies'))
    .to.be.revertedWith('No more copies left in library.');
  });

  it('Tries to return book twice', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.returnBook('Few copies'))
    .to.emit(userLibrary, 'BookReturned')
    .withArgs(['Few copies', 1]);

    await expect(userLibrary.returnBook('Few copies'))
    .to.be.revertedWith("Cannot return a book that's not borrowed.");
  });

  it('Tries to return unexisting book', async () => {
    let userLibrary = bookLibrary.connect(await helpers.user1());
    await expect(userLibrary.returnBook('Some unexisting book'))
    .to.be.revertedWith("Book is not in library.");
  });

  it('Shows borrow history', async () => {
    let history = await bookLibrary.borrowHistory('Some book', 0);
    expect(history[0]).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    expect(history[1]).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    expect(history.length).to.equal(2);

    // Why this fails?
    // expect(bookLibrary.borrowHistory('Some book'))
    // .to.equal([
    //   '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    //   '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    // ]);
  });

  it('Shows borrow history offset 1', async () => {
    let history = await bookLibrary.borrowHistory('Some book', 1);
    expect(history[0]).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    expect(history.length).to.equal(1);
  });

  it('Tries to get borrow history for non-existing', async () => {
    await expect(bookLibrary.borrowHistory('Not existing book', 0))
    .to.revertedWith('Book is not in library.');
  });

  it('Should get all books', async () => {
    expect(await bookLibrary.totalBooks()).to.equal(2);
    const [book1, book2] = await bookLibrary.allBooks(0);
    expect(book1.name).to.equal('Some book');
    expect(book1.copies).to.equal(4);
    expect(book2.name).to.equal('Few copies');
    expect(book2.copies).to.equal(1);
  });

  it('Should get all books offset 1', async () => {
    const [book2] = await bookLibrary.allBooks(1);
    expect(book2.name).to.equal('Few copies');
    expect(book2.copies).to.equal(1);
  });

  it('Should check if book is borrowed', async () => {
    let owner = await helpers.owner();
    await bookLibrary.borrowBook('Some book');
    var borrowed = await bookLibrary.bookIsBorrowedByUser('Some book', owner.address);
    expect(borrowed).to.equal(true);

    await bookLibrary.returnBook('Some book');
    borrowed = await bookLibrary.bookIsBorrowedByUser('Some book', owner.address);
    expect(borrowed).to.equal(false);

    await expect(bookLibrary.bookIsBorrowedByUser('Unexisting', owner.address))
    .to.be.revertedWith('Book is not in library.');
  });
});
