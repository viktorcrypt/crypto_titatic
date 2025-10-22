export async function getEip1193Provider() {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not found");
  return eth;
}
