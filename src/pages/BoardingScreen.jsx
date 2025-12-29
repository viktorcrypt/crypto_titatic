import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useConnect, usePublicClient, useWalletClient, useChainId } from "wagmi";
import { createSessionAccount, grantPermissions, initSmartAccountContext } from "../lib/smartAccount.js";

export default function BoardingScreen() {
  const [sessionAccount, setSessionAccount] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [permission, setPermission] = useState(() => {
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
        
        window._smartAccountContext = context;
        
        console.log("[Boarding] ✅ Ready!");
      } catch (e) {
        console.error("[Boarding] Setup error:", e);
      }
    }
    
    setup();
  }, [isConnected, publicClient, sessionAccount]);

  async function handleConnect() {
    const connector = connectors[0];
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
    <div className="relative min-h-screen bg-gradient-to-b from-sky-100 via-sky-200 to-blue-900 overflow-hidden">
      {/* Sky area with clouds */}
      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-sky-100 to-sky-300 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-20 bg-white/30 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-60 left-1/3 w-40 h-16 bg-white/35 rounded-full blur-xl animate-float-slow"></div>
      </div>

      {/* Public Navigation - Above water */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <button
          onClick={() => navigate("/stats")}
          className="group px-6 py-3 bg-white/90 hover:bg-white border border-orange-200 hover:border-orange-400 rounded-xl transition backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-semibold text-gray-800">Leaderboard</span>
          </div>
        </button>

        <button
          onClick={() => navigate("/agent")}
          className="group px-6 py-3 bg-white/90 hover:bg-white border border-cyan-200 hover:border-cyan-400 rounded-xl transition backdrop-blur-xl shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-gray-800">Agent Strategies</span>
          </div>
        </button>
      </div>

      {/* Content - Above water - RAISED */}
      <div className="relative flex flex-col items-center justify-start pt-16 pb-32 px-6 min-h-screen z-30">
        <div className="text-7xl mb-6 animate-float">🚢</div>
        
        <h1 className="text-6xl font-black mb-4 text-gray-900">
          Crypto Titanic
        </h1>
        
        <p className="text-xl text-gray-700 mb-4 max-w-lg mx-auto text-center leading-relaxed">
          The great crypto ship is going down... Board now to take command of the last lifeboat.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-900 text-sm mb-10 backdrop-blur-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Powered by ERC-7715 • Gasless via Pimlico
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            <button
              onClick={handleConnect}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition transform hover:scale-105 shadow-2xl"
            >
              🔗 Board the Ship (Connect Wallet)
            </button>
            
            <p className="text-sm text-gray-600 max-w-md mx-auto text-center">
              Connect MetaMask Flask to start your rescue mission
            </p>
          </div>
        ) : !ready ? (
          <div className="py-8">
            <div className="relative inline-block">
              <div className="w-12 h-12 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-700">Setting up your Smart Account...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
            <div className="w-full bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your EOA</div>
                  <div className="text-sm text-green-600 font-mono">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-xl">👤</span>
                </div>
              </div>
              
              <div className="w-full h-px bg-gray-200"></div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Smart Account</div>
                  <div className="text-sm text-emerald-600 font-mono">
                    {sessionAccount.address.slice(0, 8)}...{sessionAccount.address.slice(-6)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚡</span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-200"></div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${permission ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
                  <span className="text-xs text-gray-600">
                    {permission ? "Permissions ✅" : "No Permissions"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-600">Gasless ✨</span>
                </div>
              </div>
            </div>

            {!permission && (
              <button
                onClick={handleGrantPermissions}
                disabled={grantingPermissions}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-40 shadow-lg"
              >
                {grantingPermissions ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Granting Permissions...
                  </span>
                ) : (
                  "🔐 Grant Permissions (Required)"
                )}
              </button>
            )}

            <button
              onClick={() => navigate("/intro")}
              disabled={!canPlay}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-5 rounded-xl font-bold text-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            >
              {canPlay ? "⛵ Set Sail & Start Mission →" : "⚠️ Grant permissions first"}
            </button>

            {permission && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-700 text-center">
                  ✅ Session account authorized! You can now rescue coins manually or use AI agents.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animated Water Line - LOWER */}
      <div className="fixed bottom-[35vh] left-0 right-0 z-20 pointer-events-none">
        <svg className="w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#0284c7', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>
          <path 
            className="wave-animation" 
            d="M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" 
            fill="url(#waterGradient)"
          />
          <path 
            className="wave-animation-delayed" 
            d="M0,70 Q150,50 300,70 T600,70 T900,70 T1200,70 L1200,120 L0,120 Z" 
            fill="rgba(6, 182, 212, 0.4)"
          />
        </svg>
      </div>

      {/* Underwater Area */}
      <div className="fixed bottom-0 left-0 right-0 h-[35vh] bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 z-10">
        {/* Bubbles rising */}
        <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-white/30 animate-bubble"></div>
        <div className="absolute bottom-32 left-32 w-2 h-2 rounded-full bg-white/25 animate-bubble-delayed"></div>
        <div className="absolute bottom-24 right-20 w-2.5 h-2.5 rounded-full bg-white/30 animate-bubble-slow"></div>
        <div className="absolute bottom-40 right-40 w-2 h-2 rounded-full bg-white/20 animate-bubble"></div>
        <div className="absolute bottom-28 left-1/2 w-3 h-3 rounded-full bg-white/25 animate-bubble-delayed"></div>

        {/* Real SVG Coins on the ocean floor */}
        <div className="absolute bottom-12 left-[8%] transform -rotate-12 animate-sway">
          <img src="/logos/btc.svg" alt="BTC" className="w-20 h-20 drop-shadow-2xl" />
        </div>

        <div className="absolute bottom-8 left-[22%] transform rotate-6 animate-sway-delayed">
          <img src="/logos/eth.svg" alt="ETH" className="w-16 h-16 drop-shadow-2xl" />
        </div>

        <div className="absolute bottom-14 left-[38%] transform -rotate-6 animate-sway-slow">
          <img src="/logos/sol.svg" alt="SOL" className="w-18 h-18 drop-shadow-2xl" />
        </div>

        <div className="absolute bottom-6 right-[42%] transform rotate-12 animate-sway">
          <img src="/logos/link.svg" alt="LINK" className="w-14 h-14 drop-shadow-2xl" />
        </div>

        <div className="absolute bottom-16 right-[25%] transform -rotate-12 animate-sway-delayed">
          <img src="/logos/doge.svg" alt="DOGE" className="w-20 h-20 drop-shadow-2xl" />
        </div>

        <div className="absolute bottom-10 right-[10%] transform rotate-6 animate-sway-slow">
          <img src="/logos/pepe.svg" alt="PEPE" className="w-16 h-16 drop-shadow-2xl" />
        </div>

        {/* Smaller scattered coins */}
        <div className="absolute bottom-20 left-[32%] transform rotate-12 animate-sway opacity-80">
          <img src="/logos/mon.svg" alt="MON" className="w-12 h-12 drop-shadow-xl" />
        </div>
        
        <div className="absolute bottom-8 right-[35%] transform -rotate-6 animate-sway-delayed opacity-70">
          <img src="/logos/linea.svg" alt="LINEA" className="w-10 h-10 drop-shadow-xl" />
        </div>
      </div>

      {/* Info Footer - underwater */}
      <div className="fixed bottom-2 left-0 right-0 text-center text-xs text-white/40 z-30">
        <p>Powered by ERC-7715 Advanced Permissions • MetaMask Smart Accounts • Pimlico</p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes wave {
          0% { d: path("M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"); }
          50% { d: path("M0,70 Q150,50 300,70 T600,70 T900,70 T1200,70 L1200,120 L0,120 Z"); }
          100% { d: path("M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"); }
        }
        .wave-animation {
          animation: wave 4s ease-in-out infinite;
        }
        .wave-animation-delayed {
          animation: wave 4s ease-in-out infinite;
          animation-delay: -2s;
        }

        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 4s ease-in infinite;
        }
        .animate-bubble-delayed {
          animation: bubble 5s ease-in infinite;
          animation-delay: 1s;
        }
        .animate-bubble-slow {
          animation: bubble 6s ease-in infinite;
          animation-delay: 2s;
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-2deg) translateX(0); }
          50% { transform: rotate(2deg) translateX(5px); }
        }
        @keyframes sway-delayed {
          0%, 100% { transform: rotate(3deg) translateX(0); }
          50% { transform: rotate(-3deg) translateX(-5px); }
        }
        @keyframes sway-slow {
          0%, 100% { transform: rotate(-1deg) translateX(0); }
          50% { transform: rotate(1deg) translateX(3px); }
        }
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
        }
        .animate-sway-delayed {
          animation: sway-delayed 3.5s ease-in-out infinite;
        }
        .animate-sway-slow {
          animation: sway-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
