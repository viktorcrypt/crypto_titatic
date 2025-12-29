import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordRescue } from "../lib/onchain.js";
import { useNavigate } from "react-router-dom";

export default function PostRescuePanel({
  open,
  getSymbols,          
  onRecorded,          
}) {
  const [stage, setStage] = useState("idle"); 
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleRecord() {
    try {
      setStage("sending");
      const symbols = getSymbols();
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
                  We’ll write the coins you saved to Monad testnet. This will trigger a gasless UserOperation.
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
                <div className="mb-4 animate-pulse text-lg">Submitting…</div>
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
                    onClick={() => navigate("/stats")}
                    className="rounded-xl px-5 py-3 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    See who gets rescued most
                  </button>
                  <button
                    onClick={() => navigate("/agent")}
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
                  className="w-full rounded-xl px-5 py-3 bg-black text-white hover:bg-black/90"
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
