export default function Lifeboat({ picked, onRemove }) {
  return (
    <div className="rounded-2xl p-4 bg-white/10 border border-white/10 backdrop-blur">
      <div className="font-semibold mb-2">Lifeboat</div>
      {picked.length === 0 ? (
        <div className="text-white/60 text-sm">No survivors yet…</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {picked.map((t) => (
            <div key={t.symbol} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15">
              <img src={`/logos/${t.symbol.toLowerCase()}.svg`} alt={t.symbol} className="h-5 w-5 rounded-full" />
              <span className="text-sm">{t.symbol}</span>
              <button className="text-xs text-white/60 hover:text-white" onClick={()=>onRemove(t.symbol)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
