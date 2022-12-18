import { ChangeEvent, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { Spinner } from "../components/Spinner";
import { Marketplace } from "../contracts/types"

type CollectionProps = {
  marketplace: Marketplace;
  getMarketplaceInfo: () => Promise<void>;
}
export const CreateCollection = ({ marketplace, getMarketplaceInfo }: CollectionProps): JSX.Element => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [createCollectionSpinner, setCreateCollectionSpinner] = useState<boolean>(false);

  const collectionNameInput = (input: ChangeEvent<HTMLInputElement>) => {
    setName(input.target.value);
  }

  const descriptionInput = (input: ChangeEvent<HTMLInputElement>) => {
    setDescription(input.target.value);
  }

  const createCollection = async () => {
    setCreateCollectionSpinner(true);
    try {
      const tx = await marketplace.createCollection(name, '', description, 'https://ipfs.io/ipfs/');
      await tx.wait();
      getMarketplaceInfo();
    } finally {
      setCreateCollectionSpinner(false);
      clearForm();
    }
  };

  const clearForm = () => {
    setName('');
    setDescription('');
  }

  return (
    <div className="grid justify-items-center mt-12">
      <h1 className="mb-4 text-xl font-semibold tracking-tight leading-none text-main text-center">
        Collection
      </h1>
      <div className="space-y-4">
        <label className="block">
          <span className="block required text-sm font-medium text-main">Name</span>
          <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            onChange={collectionNameInput} value={name}
          />
        </label>
        <label className="block">
          <span className="block required text-sm font-medium text-main">Description</span>
          <input type="text" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:min-h-full"
            onChange={descriptionInput} value={description}
          />
        </label>
        <span className="flex h-8 space-x-6">
          <ActionButton onClick={createCollection} title='Create collection' disabled={createCollectionSpinner}/>
          {createCollectionSpinner && <Spinner />}
        </span>
      </div>

    </div>
  );
}