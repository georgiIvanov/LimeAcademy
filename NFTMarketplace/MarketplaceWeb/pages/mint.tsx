import { ChangeEvent, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { Dropdown } from "../components/Dropdown";
import { Spinner } from "../components/Spinner";
import { TokenCollection } from "../contracts/types";
import TokenCollection_abi from "../contracts/TokenCollection.json";
import useContract from "../hooks/useContract";
import { useIpfs } from "../hooks/useIpfs";
import { Collection } from "../models/Collection";
import { useWeb3React } from "@web3-react/core";

type MintProps = {
  collections: Collection[]
}

export const Mint = ({collections}: MintProps): JSX.Element => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedCollection, setCollection] = useState<Collection>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const ipfs = useIpfs();
  const [image, setImage] = useState(null);
  const { library, account } = useWeb3React();
  
  const tokenNameInput = (input: ChangeEvent<HTMLInputElement>) => {
    setName(input.target.value);
  }

  const tokenDescriptionInput = (input: ChangeEvent<HTMLInputElement>) => {
    setDescription(input.target.value);
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = (form[0]).files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    const result = await ipfs.add(file);
    console.log(result);
    setImage({
      cid: result.cid,
      path: result.path,
    });

    form.reset();
    setSpinner(false);
  };

  const mint = async () => {
    setSpinner(true);
    const metadata = {
      description: description,
      image: "https://ipfs.infura.io:5001/api/v0" + image.path,
      name: name
    }

    try {
      const result = await ipfs.add(Buffer.from(JSON.stringify(metadata)));
      console.log(result);
      const collection = useContract(
        selectedCollection.contract.address, TokenCollection_abi
      ) as TokenCollection;
      
      const tx = await collection.mint(account, result.path);
      await tx.wait();
    } finally {
      setSpinner(false);
    }
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

        <label className="block">
          <div>
            {ipfs && image == null && selectedCollection != null && (
              <>
                <span className="block required text-sm font-medium text-main">Image upload</span>
                <form onSubmit={onSubmitHandler}>
                  <input type="file" name="file" />
                  <ActionButton onClick={() => { }} title='Upload file' disabled={image != null} />
                </form>
              </>
            )}
            {image && (
              <img
              // using this subdomain does not require authorisation of the request
              src={"https://skywalker.infura-ipfs.io/ipfs/" + image.path}
              style={{ maxWidth: "400px", margin: "15px" }}
              key={image.cid.toString()}
            />
            )}
          </div>
        </label>
        
        <span className="flex mx-auto">
          <ActionButton
            onClick={mint}
            title='Mint'
            disabled={spinner || image == null || name.length == 0 || description.length == 0} />
          {spinner && <Spinner />}
        </span>
      </div>

    </div>
  );
}