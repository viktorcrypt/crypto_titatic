// src/lib/wallet.js
export const MONAD_CHAIN_ID_HEX = import.meta.env.VITE_CHAIN_ID || "0x279f"; // hex!
export const MONAD_RPC = import.meta.env.VITE_MONAD_RPC;

export async function connectEOA() {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");

  
  const accounts = await eth.request({ method: "eth_requestAccounts" });
  const address = accounts?.[0];
  if (!address) throw new Error("No account");

 
  let chainId = await eth.request({ method: "eth_chainId" });
  if (chainId.toLowerCase() !== String(MONAD_CHAIN_ID_HEX).toLowerCase()) {
    try {
      
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CHAIN_ID_HEX }],
      });
      chainId = await eth.request({ method: "eth_chainId" });
    } catch {
      
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: MONAD_CHAIN_ID_HEX,
          chainName: "Monad Testnet",
          rpcUrls: [MONAD_RPC],
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          blockExplorerUrls: [], 
        }],
      });
      chainId = await eth.request({ method: "eth_chainId" });
    }
  }

  return { address, chainId };
}
