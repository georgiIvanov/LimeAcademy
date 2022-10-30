import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BookLibrary, BookLibrary__factory } from '../typechain-types';
import * as helpers from './TestHelpers';

describe('Book library borrow history', () => {
  let bookLibraryFactory: BookLibrary__factory;
  let bookLibrary: BookLibrary;

  beforeEach( async () => {    
    bookLibraryFactory = await ethers.getContractFactory('BookLibrary');
    bookLibrary = await bookLibraryFactory.deploy();
  });

  it('Should display exactly 20 in history', async () => {
    await bookLibrary.addBook({name: "Book", copies: 20});
    expect(await bookLibrary.totalBooks()).to.equal(1);

    for(var i = 0; i < 20; i++) {
      await bookLibrary.borrowBook("Book");  
      await bookLibrary.returnBook("Book");
    }

    let userBookLibrary = bookLibrary.connect(await helpers.user1());
    await userBookLibrary.borrowBook("Book");  
    await userBookLibrary.returnBook("Book");
    
    let history = await bookLibrary.borrowHistory("Book", 0);
    expect(history.length).to.equal(20);

    let owner = await helpers.owner();
    history.forEach(element => {
      expect(element).to.equal(owner.address);
    });
  });

  it('Should display exactly 20 with 20 offset', async () => {
    await bookLibrary.addBook({name: "Book", copies: 20});
    expect(await bookLibrary.totalBooks()).to.equal(1);

    // First 20 books, owner
    for(var i = 0; i < 20; i++) {
      await bookLibrary.borrowBook("Book");  
      await bookLibrary.returnBook("Book");
    }

    // Second 20 books, user
    let user1 = await helpers.user1();
    let userBookLibrary = bookLibrary.connect(user1);
    for(var i = 0; i < 20; i++) {
      await userBookLibrary.borrowBook("Book");  
      await userBookLibrary.returnBook("Book");
    }
    
    // Last book (41st), owner
    await bookLibrary.borrowBook("Book");  
    await bookLibrary.returnBook("Book");

    
    let history = await bookLibrary.borrowHistory("Book", 20);
    expect(history.length).to.equal(20);

    history.forEach(element => {
      expect(element).to.equal(user1.address);
    });
  });

  it('Should display last 3 books, offset 17', async () => {
    await bookLibrary.addBook({name: "Book", copies: 20});
    expect(await bookLibrary.totalBooks()).to.equal(1);

    // First 17 books, owner
    for(var i = 0; i < 17; i++) {
      await bookLibrary.borrowBook("Book");  
      await bookLibrary.returnBook("Book");
    }

    // Second 3 books, user
    let user1 = await helpers.user1();
    let userBookLibrary = bookLibrary.connect(user1);
    for(var i = 0; i < 3; i++) {
      await userBookLibrary.borrowBook("Book");  
      await userBookLibrary.returnBook("Book");
    }
    
    let history = await bookLibrary.borrowHistory("Book", 17);
    expect(history.length).to.equal(3);

    history.forEach(element => {
      expect(element).to.equal(user1.address);
    });
  });

  it('Should revert when offset is more than books count', async () => {
    await bookLibrary.addBook({name: "Book", copies: 20});
    expect(await bookLibrary.totalBooks()).to.equal(1);

    // 7 books, owner
    for(var i = 0; i < 3; i++) {
      await bookLibrary.borrowBook("Book");  
      await bookLibrary.returnBook("Book");
    }
    
    await expect(bookLibrary.borrowHistory("Book", 3))
    .to.be.revertedWith("Offset should be less than amount of borrowed books.");
  });
});