import { sepolia } from "viem/chains";

export const ACTIVE_CHAIN = sepolia;

export function getChainName() {
  return "Sepolia";
}

export function getChainId() {
  return 11155111;
}

export function getExplorerUrl() {
  return "https://sepolia.etherscan.io";
}

export function getExplorerTxUrl(hash) {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

export function getExplorerAddressUrl(address) {
  return `https://sepolia.etherscan.io/address/${address}`;
}
