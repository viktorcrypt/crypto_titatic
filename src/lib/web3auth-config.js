import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const clientId = "BHgArYmWwSeq21czpcarYh0EVq2WWOzflX-NTK-tY1-1pauPzHKRRLgpABkmYiIV_og9jAvoIxQ8L3Smrwe04Lw";

export const web3AuthConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    chainConfig: {
      chainNamespace: 'eip155',
      chainId: '0xaa36a7', // Sepolia
      rpcTarget: 'https://ethereum-sepolia-rpc.publicnode.com',
      displayName: 'Ethereum Sepolia Testnet',
      blockExplorerUrl: 'https://sepolia.etherscan.io',
      ticker: 'ETH',
      tickerName: 'Ethereum',
    },
  },
};

export default web3AuthConfig;
