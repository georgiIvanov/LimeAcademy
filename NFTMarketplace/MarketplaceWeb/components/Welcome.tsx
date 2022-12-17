type WelcomeProps = {
  connect: JSX.Element
}

export const Welcome = ({connect}: WelcomeProps): JSX.Element => {
  return (
    <div className="grid grid-cols-1 gap-12 place-content-center mt-20">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-main md:text-5xl lg:text-6xl text-center">
        This is NFT Market Place
      </h1>

      <h2 className="mb-4 text-4xl font-bold tracking-tight leading-none text-main md:text-3xl lg:text-4xl text-center">
        You can use this marketplace to create, buy & sell NFTs
      </h2>

      <p className="mb-4 text-xl font-semibold tracking-tight leading-none text-main text-center">
        Connect Your Wallet
      </p>

      <div className="text-center">
        {connect}
      </div>
      
    </div>
  );
}