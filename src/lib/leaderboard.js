// src/lib/leaderboard.js
import { createPublicClient, http } from "viem";
import { monadTestnet } from "../lib/chain";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "./rescueAbi";

// Можно задать стартовый блок, чтобы не сканить всю сеть.
// Если не знаешь — оставь пустым, но лучше добавить env:
// VITE_RESCUELOG_START_BLOCK=123456
const START_BLOCK = import.meta.env.VITE_RESCUELOG_START_BLOCK
  ? BigInt(import.meta.env.VITE_RESCUELOG_START_BLOCK)
  : undefined;

// RPC ДЛЯ ЧТЕНИЯ (Alchemy/DRPC и т.п.), НЕ Pimlico!
const RPC = import.meta.env.VITE_MONAD_RPC;

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC),
});

export async function fetchLeaderboard() {
  // читаем все события Rescued
  const logs = await publicClient.getLogs({
    address: RESCUE_LOG_ADDR,
    abi: RESCUE_LOG_ABI,
    eventName: "Rescued",
    fromBlock: START_BLOCK ?? "earliest",
    toBlock: "latest",
  });

  // Агрегируем по символам
  const bySymbol = new Map();
  const rescues = []; // для "последние спасения"

  for (const lg of logs) {
    // Поддержим обе версии контракта (старую и новую).
    // Новая: event Rescued(address by, bytes32 selectionHash, string[] symbols, uint256 totalWeight, bool byAgent)
    // Старая: event Rescued(address rescuer, string[] symbols)

    const args = lg.args || {};
    let symbols = [];
    let by = args.by ?? args.rescuer;
    let totalWeight = args.totalWeight ?? null;
    let byAgent = args.byAgent ?? null;

    if (Array.isArray(args.symbols)) {
      symbols = args.symbols;
    }

    // суммируем по символам
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

  // сортируем по убыванию
  const rows = Array.from(bySymbol.entries())
    .map(([symbol, { count }]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count);

  // последние N спасений (по времени)
  rescues.sort((a, b) => Number(b.blockNumber - a.blockNumber));
  const recent = rescues.slice(0, 15);

  return { rows, recent };
}
