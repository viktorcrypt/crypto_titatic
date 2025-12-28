// src/lib/wallet.js
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // Sepolia hex chainId
export const SEPOLIA_RPC = import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export async function connectEOA() {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");

  // Request accounts
  const accounts = await eth.request({ method: "eth_requestAccounts" });
  const address = accounts?.[0];
  if (!address) throw new Error("No account");

  // Check/switch to Sepolia
  let chainId = await eth.request({ method: "eth_chainId" });
  if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID_HEX.toLowerCase()) {
    try {
      // Try to switch
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      chainId = await eth.request({ method: "eth_chainId" });
    } catch {
      // Add if not exists
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: SEPOLIA_CHAIN_ID_HEX,
          chainName: "Sepolia",
          rpcUrls: [SEPOLIA_RPC],
          nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
      chainId = await eth.request({ method: "eth_chainId" });
    }
  }

  return { address, chainId };
}
