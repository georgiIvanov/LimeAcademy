
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

export const MARKETPLACE_ADDRESS = "0xC7aBA17fA38Bcc13E7a8992929b1d815E9682FC0";