// src/lib/onchain.js
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "./rescueAbi.js";
import {
  initSmartAccount,
  makeCalldata,
  sendCalls,
  userOpTrackUrl,
  makePublicClient,
} from "../lib/smartAccount.js";

let _ctx = null;
let _owner = null;

export async function ensureCtx() {
  if (_ctx) return _ctx;
  console.log("[onchain] init SA ctx…");
  const ctx = await initSmartAccount();
  _ctx = ctx;
  _owner = ctx.address;
  console.log("[onchain] SA ready:", ctx.address);
  return ctx;
}

export async function recordRescue(symbols) {
  console.log("[onchain] recordRescue symbols:", symbols);
  const ctx = await ensureCtx();
  const rescuer = _owner ?? ctx.address;

  const data = makeCalldata(RESCUE_LOG_ABI, "logRescue", [rescuer, symbols]);
  // дебаг: убедимся, что сигнатура правильная
  try {
    const publicClient = makePublicClient();
    const selector = data.slice(0, 10);
    console.log("[onchain] calldata selector:", selector, "(expect logRescue)");
    // опционально: симуляция (но не критично)
    console.log("[onchain] simulate start");
    await Promise.race([
      publicClient.simulateContract({
        address: RESCUE_LOG_ADDR,
        abi: RESCUE_LOG_ABI,
        functionName: "logRescue",
        args: [rescuer, symbols],
        account: ctx.address,
      }),
      new Promise((_, r) => setTimeout(() => r(new Error("simulateContract timeout after 4000ms")), 4000)),
    ]);
  } catch (e) {
    console.warn("[onchain] simulate skipped/warn:", e.message || e);
  }

  console.log("[onchain] sendUserOp start");
  const { hash } = await sendCalls(ctx, { to: RESCUE_LOG_ADDR, data });
  console.log("[onchain] userOp hash:", hash);

  return {
    userOpHash: hash,
    userOpUrl: userOpTrackUrl(hash),
  };
}
