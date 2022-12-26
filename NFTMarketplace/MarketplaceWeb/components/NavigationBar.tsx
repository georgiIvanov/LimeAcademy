import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Account from "../components/Account";
import { Route } from "../constants/route";

type NavigationBarProps = {
  triedToEagerConnect: boolean;
  balance: JSX.Element;
  setRoute: Dispatch<SetStateAction<Route>>;
};

export const NavigationBar = ({triedToEagerConnect, balance, setRoute}: NavigationBarProps): JSX.Element => {
  return (
    <nav className="flex component-background p-6">
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <button
            className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4"
            onClick={() => { setRoute(Route.Home) }}
          >
            Home
          </button>
          <button
            className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4"
            onClick={() => { setRoute(Route.Mint) }}
          >
            Mint
          </button>
          <button
            className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4"
            onClick={() => { setRoute(Route.Collection) }}
          >
            Collection
          </button>
          <button
            className="block mt-4 ml-20 lg:inline-block lg:mt-0 text-main font-bold hover:text-white mr-4"
            onClick={() => { setRoute(Route.Profile) }}
          >
            Profile
          </button>
        </div>
        <div>
          <Account triedToEagerConnect={triedToEagerConnect} balance={balance}/>
        </div>
      </div>
    </nav>
  );
}