import { keccak256, toBytes } from "viem";
import { RESCUELOG_ABI } from "./rescueAbi";
import { makeCalldata, sendCalls } from "./smartAccount";

const RESCUELOG_ADDRESS = import.meta.env.VITE_RESCUELOG_ADDRESS;

export async function warmup(ctx) {
  if (!RESCUELOG_ADDRESS) throw new Error("Missing VITE_RESCUELOG_ADDRESS");

  const symbols = ["WARMUP"];
  const selectionHash = keccak256(toBytes("WARMUP"));

  const data = makeCalldata(RESCUELOG_ABI, "logRescue", [
    symbols,
    0n,
    false,
    selectionHash,
  ]);

  // одна userOp через бандлер/paymaster Pimlico
  const { hash } = await sendCalls(ctx, {
    to: RESCUELOG_ADDRESS,
    data,
    value: 0n,
  });
  return hash; // userOpHash
}
