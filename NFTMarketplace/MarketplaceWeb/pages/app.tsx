import { Route } from "../constants/route";

type AppProps = {
  route: Route;
}

export const App = ({route}: AppProps): JSX.Element => {
  switch (route) {
    case Route.Home: return <p>Home</p>
    case Route.Mint: return <p>Mint</p>
    case Route.Collection: return <p>Collection</p>
    case Route.Profile: return <p>Profile</p>
  }

  return (<p>App</p>);
}