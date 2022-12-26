import { MarketplaceToken } from "../components/MarketplaceToken";
import { Collection } from "../models/Collection";

type HomeProps = {
  collections: Collection[]
};

export const Home = ({collections}: HomeProps): JSX.Element => {
  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="mb-4 text-xl font-semibold tracking-tight leading-none text-main text-center">
        Home
      </h1>

      {
        <div className="justify-items-center grid grid-cols-3 gap-y-5">
          {
            collections.map((col) => {
              return col.tokens.map((token) => {
                return <MarketplaceToken token={token} />;
              });
            })
          }
        </div>
      }
      
    </div>
  );
}