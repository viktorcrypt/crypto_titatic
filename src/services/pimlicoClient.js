import { createPimlicoClient } from "permissionless/clients/pimlico";
import { http } from "viem";

const pimlicoKey = import.meta.env.VITE_PIMLICO_API_KEY;

if (!pimlicoKey) {
  throw new Error("Pimlico API key is not set");
}

/**
 * Pimlico client instance configured for Sepolia network
 * Used for estimating gas prices (maxFeePerGas, maxPriorityFeePerGas) for sending a UserOperation
 */
export const pimlicoClientFactory = (chainId) => createPimlicoClient({
  transport: http(
    `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${pimlicoKey}`
  ),
});
