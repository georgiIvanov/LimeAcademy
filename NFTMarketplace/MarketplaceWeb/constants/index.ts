export interface Networks {
  [key: number]: string;
}
export const walletConnectSupportedNetworks: Networks = {
  // Add your network rpc URL here
  1: "https://ethereumnode.defiterm.io",
  3: "https://ethereumnode.defiterm-dev.net"
};

// Network chain ids
export const supportedMetamaskNetworks = [1, 3, 4, 5, 42];