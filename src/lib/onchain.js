import {
  RESCUE_LOG_ABI,
  RESCUE_LOG_ADDR,
} from "./rescueAbi.js";

import {
  initSmartAccount,
  makeCalldata,
  sendCalls,
  userOpTrackUrl,
  makePublicClient,
} from "../lib/smartAccount.js";

import { TOKENS } from "./tokens.js";
import { keccak256, encodeAbiParameters } from "viem";

let _ctx = null;

function weightOf(symbol) {
  const t = TOKENS.find((x) => x.symbol === symbol);
  return t ? t.weight : 0;
}

export async function ensureCtx() {
  if (_ctx) return _ctx;
  const ctx = await initSmartAccount();
  return (_ctx = ctx);
}

export async function recordRescue(symbols, opts = {}) {
  // opts.byAgent можно пробрасывать позже из UI; по умолчанию false
  const byAgent = !!opts.byAgent;

  console.log("[onchain] recordRescue symbols:", symbols);

  const ctx = await ensureCtx();
  console.log("[onchain] SA ready:", ctx.address);

  // 1) посчитаем общий вес на основе твоего TOKENS
  const totalWeightNum = symbols.reduce((s, sym) => s + weightOf(sym), 0);
  const totalWeight = BigInt(totalWeightNum);

  // 2) selectionHash = keccak256( abi.encode(symbols, totalWeight, byAgent) )
  const encoded = encodeAbiParameters(
    [
      { type: "string[]" },
      { type: "uint256" },
      { type: "bool" },
    ],
    [symbols, totalWeight, byAgent]
  );
  const selectionHash = keccak256(encoded);

  // 3) закодим calldata по НОВОМУ ABI/сигнатуре
  const data = makeCalldata(RESCUE_LOG_ABI, "logRescue", [
    symbols,
    totalWeight,
    byAgent,
    selectionHash,
  ]);

  const selector = data.slice(0, 10);
  console.log("[onchain] calldata selector:", selector, "(expect logRescue)");

  // 4) быстрая симуляция (не обязательна, но удобно для логов)
  try {
    console.log("[onchain] simulate start");
    const pc = makePublicClient();
    await pc.simulateContract({
      address: RESCUE_LOG_ADDR,
      abi: RESCUE_LOG_ABI,
      functionName: "logRescue",
      args: [symbols, totalWeight, byAgent, selectionHash],
    });
    console.log("[onchain] simulate ok");
  } catch (e) {
    console.warn("[onchain] simulate skipped/warn:", e?.message || e);
    // продолжаем — бандлер всё равно симулирует ещё раз
  }

  // 5) отправляем UserOperation через бандлер/пеймастер
  console.log("[onchain] sendUserOp start");
  const { hash } = await sendCalls(ctx, {
    to: RESCUE_LOG_ADDR,
    data,
  });

  return {
    userOpHash: hash,
    userOpUrl: userOpTrackUrl(hash),
  };
}
export { makeCalldata, sendCalls, userOpTrackUrl } from "../lib/smartAccount.js";
