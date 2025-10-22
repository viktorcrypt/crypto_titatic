// src/lib/leaderboard.js
import { createPublicClient, http } from "viem";
import { monadTestnet } from "../lib/chain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "./rescueAbi";


const START_BLOCK = import.meta.env.VITE_RESCUELOG_START_BLOCK
  ? BigInt(import.meta.env.VITE_RESCUELOG_START_BLOCK)
  : undefined;


const RPC = import.meta.env.VITE_MONAD_RPC;

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC),
});

export async function fetchLeaderboard() {
 
  const logs = await publicClient.getLogs({
    address: RESCUE_LOG_ADDR,
    abi: RESCUE_LOG_ABI,
    eventName: "Rescued",
    fromBlock: START_BLOCK ?? "earliest",
    toBlock: "latest",
  });

  
  const bySymbol = new Map();
  const rescues = []; 

  for (const lg of logs) {
    

    const args = lg.args || {};
    let symbols = [];
    let by = args.by ?? args.rescuer;
    let totalWeight = args.totalWeight ?? null;
    let byAgent = args.byAgent ?? null;

    if (Array.isArray(args.symbols)) {
      symbols = args.symbols;
    }

    
    for (const s of symbols) {
      const key = String(s);
      const prev = bySymbol.get(key) || { count: 0, lastBy: null };
      bySymbol.set(key, { count: prev.count + 1, lastBy: by });
    }

    rescues.push({
      by,
      symbols,
      totalWeight,
      byAgent,
      blockNumber: lg.blockNumber,
      txHash: lg.transactionHash,
    });
  }

 
  const rows = Array.from(bySymbol.entries())
    .map(([symbol, { count }]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count);

 
  rescues.sort((a, b) => Number(b.blockNumber - a.blockNumber));
  const recent = rescues.slice(0, 15);

  return { rows, recent };
}
