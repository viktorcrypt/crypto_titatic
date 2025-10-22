// src/pages/BoardingScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectEOA } from "../lib/wallet.js";
import {
  initSmartAccount,
  makePublicClient,
  monadAddressUrl,
  userOpTrackUrl,
} from "../lib/smartAccount.js";
import { warmup } from "../lib/warmup.js";

const LS_KEY = "sa_initialized";

export default function BoardingScreen() {
  const [connecting, setConnecting] = useState(false);
  const [ctx, setCtx] = useState(null); 
  const [eoa, setEoa] = useState("");
  const [initialized, setInitialized] = useState(
    typeof window !== "undefined" && localStorage.getItem(LS_KEY) === "1"
  );
  const [lastOp, setLastOp] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    async function checkDeployed() {
      try {
        if (!ctx) return;
        const pc = makePublicClient();
        const code = await pc.getCode({ address: ctx.address });
        if (code && code !== "0x") {
          setInitialized(true);
          localStorage.setItem(LS_KEY, "1");
        }
      } catch {}
    }
    checkDeployed();
  }, [ctx]);

  async function handleConnect() {
    try {
      setConnecting(true);
      
      const { address } = await connectEOA();
      setEoa(address);

      
      const saCtx = await initSmartAccount();
      setCtx(saCtx);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }

  async function handleWarmup() {
    try {
      if (!ctx) throw new Error("Smart Account not initialized yet");
      const userOpHash = await warmup(ctx); 
      setInitialized(true);
      localStorage.setItem(LS_KEY, "1");
      setLastOp({
        sa: ctx.address,
        explorer: monadAddressUrl(ctx.address),
        userOp: userOpTrackUrl(userOpHash),
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Warmup failed");
    }
  }

  const connected = !!ctx;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-slate-950 text-white text-center">
      <h1 className="text-5xl font-bold mb-4">🚢 Crypto Titanic</h1>
      <p className="text-white/70 mb-10 max-w-md">
        The great crypto ship is going down... Board now to take command of the last lifeboat.
      </p>

      {!connected ? (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl disabled:opacity-40"
        >
          {connecting ? "Connecting..." : "Board the Ship (Connect Wallet)"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm text-green-400">
            EOA: {eoa.slice(0, 6)}...{eoa.slice(-4)}
          </div>
          <div className="text-sm text-emerald-400">
            Smart Account: {ctx.address.slice(0, 6)}...{ctx.address.slice(-4)}
          </div>

          
          {!initialized && (
            <button
              onClick={handleWarmup}
              className="mt-2 bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl"
            >
              Initialize Smart Account (one-time)
            </button>
          )}

          
          {lastOp && (
            <div className="mt-2 text-xs text-white/70 space-y-1">
              <div>
                SA:&nbsp;
                <a
                  className="underline"
                  href={lastOp.explorer}
                  target="_blank"
                  rel="noreferrer"
                >
                  {ctx.address.slice(0, 6)}...{ctx.address.slice(-4)}
                </a>
              </div>
              <div>
                UserOp:&nbsp;
                <a
                  className="underline"
                  href={lastOp.userOp}
                  target="_blank"
                  rel="noreferrer"
                >
                  {lastOp.userOp.slice(0, 38)}…
                </a>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/intro")}
            className="mt-2 bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl"
          >
            Set Sail →
          </button>
        </div>
      )}
    </div>
  );
}
