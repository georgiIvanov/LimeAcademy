import { MarketplaceToken } from "../components/MarketplaceToken";
import { Collection } from "../models/Collection";

type HomeProps = {
  collections: Collection[]
};

export const Home = ({collections}: HomeProps): JSX.Element => {
  return (
    <div className="mt-12">
      <h1 className="mb-4 text-xl font-semibold tracking-tight leading-none text-main text-center">
        Home
      </h1>

      {
        <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-10 mx-20 mt-10 mb-10">
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