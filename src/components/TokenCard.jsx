export default function TokenCard({ token, onPick, disabled }) {
  return (
    <button
      onClick={() => onPick(token)}
      disabled={disabled}
      className={`group flex items-center gap-3 w-full rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 
                  backdrop-blur border border-white/10 transition 
                  disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <img
        src={`/logos/${token.symbol.toLowerCase()}.svg`}
        onError={(e)=>{ e.currentTarget.src="/logos/btc.svg" }} 
        alt={token.symbol}
        className="h-8 w-8 rounded-full"
      />
      <div className="flex-1 text-left">
        <div className="font-semibold">{token.name} <span className="text-white/60">({token.symbol})</span></div>
        <div className="text-sm text-white/60">Weight: {token.weight}</div>
      </div>
      <span className="opacity-0 group-hover:opacity-100 text-sm">Save</span>
    </button>
  );
}
