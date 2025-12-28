import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useConnect, usePublicClient, useWalletClient, useChainId } from "wagmi";
import { createSessionAccount, grantPermissions, initSmartAccountContext } from "../lib/smartAccount.js";

export default function BoardingScreen() {
  const [sessionAccount, setSessionAccount] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [permission, setPermission] = useState(() => {
    // Load permission from localStorage on mount
    const saved = localStorage.getItem("crypto_titanic_permission");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        window._permission = parsed;
        return parsed;
      } catch (e) {
        console.error("[Boarding] Failed to parse saved permission:", e);
      }
    }
    return null;
  });
  const [grantingPermissions, setGrantingPermissions] = useState(false);
  
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // Auto-create session account when connected
  useEffect(() => {
    async function setup() {
      if (!isConnected || !publicClient || sessionAccount) return;
      
      try {
        console.log("[Boarding] Creating session account...");
        const sa = await createSessionAccount(publicClient);
        setSessionAccount(sa);
        
        console.log("[Boarding] Creating context...");
        const context = await initSmartAccountContext(publicClient);
        setCtx(context);
        
        // Save globally
        window._smartAccountContext = context;
        
        console.log("[Boarding] ✅ Ready!");
      } catch (e) {
        console.error("[Boarding] Setup error:", e);
      }
    }
    
    setup();
  }, [isConnected, publicClient, sessionAccount]);

  async function handleConnect() {
    const connector = connectors[0]; // metaMask
    if (connector) {
      connect({ connector });
    }
  }

  async function handleGrantPermissions() {
    if (!sessionAccount || !walletClient) return;
    
    try {
      setGrantingPermissions(true);
      console.log("[Boarding] Granting permissions...");
      
      const perm = await grantPermissions(sessionAccount, walletClient, chainId);
      setPermission(perm);
      
      // Save permission to localStorage AND globally
      localStorage.setItem("crypto_titanic_permission", JSON.stringify(perm));
      window._permission = perm;
      
      console.log("[Boarding] ✅ Permissions granted!");
    } catch (e) {
      console.error("[Boarding] Permission error:", e);
      alert(e.message || "Failed to grant permissions");
    } finally {
      setGrantingPermissions(false);
    }
  }

  const ready = isConnected && ctx;
  const canPlay = ready && permission;

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-slate-950 text-white text-center px-6">
      <h1 className="text-5xl font-bold mb-4">🚢 Crypto Titanic</h1>
      <p className="text-white/70 mb-10 max-w-md">
        The great crypto ship is going down... Board now to take command of the last lifeboat.
      </p>

      {!isConnected ? (
        <button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl"
        >
          Board the Ship (Connect Wallet)
        </button>
      ) : !ready ? (
        <div className="text-white/70">Setting up your Smart Account...</div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          {/* Connection Info */}
          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="text-xs text-white/50 uppercase tracking-wide">Your EOA</div>
            <div className="text-sm text-green-400 font-mono">
              {address.slice(0, 8)}...{address.slice(-6)}
            </div>
            
            <div className="text-xs text-white/50 uppercase tracking-wide mt-3">Your Smart Account (Session)</div>
            <div className="text-sm text-emerald-400 font-mono">
              {sessionAccount.address.slice(0, 8)}...{sessionAccount.address.slice(-6)}
            </div>

            <div className="text-xs text-white/50 mt-3 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${permission ? 'bg-emerald-400' : 'bg-yellow-400'} animate-pulse`} />
              {permission ? "Permissions: Granted ✅" : "Permissions: Not granted"}
            </div>

            <div className="text-xs text-white/50 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gas Sponsor: Pimlico (Gasless ✨)
            </div>
          </div>

          {/* Grant Permissions Button */}
          {!permission && (
            <button
              onClick={handleGrantPermissions}
              disabled={grantingPermissions}
              className="w-full bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold transition disabled:opacity-40"
            >
              {grantingPermissions ? "Granting Permissions..." : "Grant Permissions (Required)"}
            </button>
          )}

          {/* Start Button */}
          <button
            onClick={() => navigate("/intro")}
            disabled={!canPlay}
            className="w-full bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canPlay ? "Set Sail →" : "Grant permissions first"}
          </button>

          {permission && (
            <p className="text-xs text-white/60 text-center">
              You've granted the session account permission to act on your behalf.<br />
              This enables both manual play and agent automation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
