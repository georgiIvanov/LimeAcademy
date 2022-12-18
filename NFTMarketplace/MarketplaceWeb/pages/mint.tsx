import { ChangeEvent, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { Dropdown } from "../components/Dropdown";
import { Spinner } from "../components/Spinner";
import { ITokenCollection } from "../contracts/types";
import { Collection } from "../models/Collection";

type MintProps = {
  collections: Collection[]
}

export const Mint = ({collections}: MintProps): JSX.Element => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCollection, setCollection] = useState<Collection>(null);
  const [spinner, setSpinner] = useState<boolean>(false);

  const tokenNameInput = (input: ChangeEvent<HTMLInputElement>) => {
    setName(input.target.value);
  }

  const tokenDescriptionInput = (input: ChangeEvent<HTMLInputElement>) => {
    setDescription(input.target.value);
  }

  const mint = async () => {
    setSpinner(true);
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="mb-4 text-xl font-semibold tracking-tight leading-none text-main text-center">
        Mint
      </h1>
      <div className="space-y-4">
        <label className="block">
          <span className="block required text-sm font-medium text-main">Name</span>
          <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            onChange={tokenNameInput} value={name}
          />
        </label>
        <label className="block">
          <span className="block required text-sm font-medium text-main">Description</span>
          <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:min-h-full"
            onChange={tokenDescriptionInput} value={description}
          />
        </label>

        <span className="block required text-sm font-medium text-main">Collection</span>
        <Dropdown
          items={collections}
          selected={selectedCollection}
          itemKey={(col) => { return col.contract.address; }}
          selectedTitle={(col) => { return col.name; } }
          setSelected={(col) => { setCollection(col) }}
        />
        <span className="flex mx-auto">
          <ActionButton onClick={mint} title='Mint' disabled={spinner}/>
          {spinner && <Spinner />}
        </span>
      </div>

    </div>
  );
}