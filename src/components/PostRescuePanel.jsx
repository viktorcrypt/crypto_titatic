// src/components/PostRescuePanel.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordRescue } from "../lib/onchain.js";

export default function PostRescuePanel({
  open,
  getSymbols,          // () => string[]
  onRecorded,          // ({userOpHash,userOpUrl}) => void
  onShowStats,         // () => void
  onDelegate,          // () => void
}) {
  const [stage, setStage] = useState("idle"); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  async function handleRecord() {
    if (stage === "sending") return;
    try {
      setStage("sending");
      const symbols = getSymbols();
      console.log("[UI] record click, symbols:", symbols);
      const r = await recordRescue(symbols);
      setResult(r);
      setStage("done");
      onRecorded?.(r);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to record on-chain");
      setStage("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* bright background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-100 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <motion.div
            className="relative w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 backdrop-blur p-8 shadow-2xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
          >
            {stage === "idle" && (
              <>
                <h2 className="text-2xl font-bold mb-2">Record your rescue</h2>
                <p className="text-black/70 mb-6">
                  We’ll write the coins you saved to Monad testnet via a gasless UserOperation.
                  MetaMask will ask you to sign a short confirmation message.
                </p>
                <button
                  onClick={handleRecord}
                  className="w-full rounded-xl px-5 py-3 bg-black text-white hover:bg-black/90"
                >
                  Record on-chain
                </button>
              </>
            )}

            {stage === "sending" && (
              <div className="text-center">
                <div className="mb-4 text-lg">Submitting… check MetaMask</div>
                <div className="mx-auto h-2 w-full rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-black/80 animate-[pulse_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {stage === "done" && (
              <>
                <h2 className="text-2xl font-bold mb-3">Recorded ✅</h2>
                <p className="text-black/70 mb-4">
                  Your UserOperation was submitted. You can track it here:
                </p>
                {result?.userOpUrl && (
                  <a
                    href={result.userOpUrl}
                    target="_blank"
                    className="inline-block mb-6 underline text-blue-600"
                    rel="noreferrer"
                  >
                    Open in Pimlico Explorer
                  </a>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={onShowStats}
                    className="rounded-xl px-5 py-3 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    See who gets rescued most
                  </button>
                  <button
                    onClick={onDelegate}
                    className="rounded-xl px-5 py-3 bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Let an agent decide for me
                  </button>
                </div>
              </>
            )}

            {stage === "error" && (
              <>
                <h2 className="text-2xl font-bold mb-2">Oops…</h2>
                <p className="text-red-600 mb-4">{err}</p>
                <button
                  onClick={() => setStage("idle")}
                  className="rounded-xl px-4 py-2 bg-black text-white"
                >
                  Try again
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
