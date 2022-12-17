import { useEffect, useState } from "react";
import Account from "../components/Account";

type NavigationBarProps = {
  triedToEagerConnect: boolean;
  balance: JSX.Element;
};

export const NavigationBar = ({triedToEagerConnect, balance}: NavigationBarProps): JSX.Element => {
  return (
    <nav className="flex items-center justify-between flex-wrap component-background p-6">
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <a href="#responsive-header" className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4">
            Home
          </a>
          <a href="#responsive-header" className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4">
            Mint
          </a>
          <a href="#responsive-header" className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4">
            Collection
          </a>
          <a href="#responsive-header" className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4">
            Profile
          </a>
        </div>
        <div>
          <Account triedToEagerConnect={triedToEagerConnect} balance={balance}/>
        </div>
      </div>
    </nav>
  );
}