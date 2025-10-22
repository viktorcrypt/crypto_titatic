import { useMemo } from "react";

export default function LifeboatDrop({
  picked,
  capacity,
  onDrop,
  onRemove,
  svgSrc = "/boats/boat.svg",
  width = 520,
  rocking = true, 
}) {
  const used = useMemo(() => picked.reduce((s, t) => s + t.weight, 0), [picked]);
  const pct = Math.min(100, Math.round((used / capacity) * 100));

  const W = width;
  const H = Math.round((width * 140) / 240);

  const DROP_LEFT = 0.11 * W;
  const DROP_RIGHT = 0.11 * W;
  const DROP_TOP = 0.48 * H;
  const DROP_HEIGHT = 0.24 * H;

  function handleDrop(e) {
    e.preventDefault();
    const symbol = e.dataTransfer.getData("text/plain");
    if (!symbol) return;
    onDrop(symbol);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`pointer-events-auto relative select-none ${rocking ? 'boat-bob' : ''}`}
      title="Lifeboat"
      style={{ width: W, height: H }}
    >
      
      <img
        src={svgSrc}
        alt="lifeboat"
        className="absolute inset-0 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] z-10"
        draggable={false}
      />

      
      <div
        className="absolute rounded-full bg-white/70 backdrop-blur z-20"
        style={{
          left: DROP_LEFT,
          right: DROP_RIGHT,
          top: DROP_TOP,
          height: DROP_HEIGHT,
          boxShadow: "inset 0 2px 9px rgba(0,0,0,.22)",
        }}
      />

      
      <div
        className="absolute rounded-full bg-black/20 overflow-hidden z-20"
        style={{
          left: W * 0.18,
          right: W * 0.18,
          bottom: H * 0.16,     
          height: 8,
        }}
      >
        <div className="h-full" style={{ width: `${pct}%` }} />
      </div>

      
      <div
        className="absolute flex items-center justify-center gap-6 px-10 z-30"
        style={{
          left: DROP_LEFT,
          right: DROP_RIGHT,
          top: DROP_TOP + DROP_HEIGHT * 0.05,
          height: DROP_HEIGHT * 0.9,
        }}
      >
        {picked.map((t) => (
          <div key={t.symbol} className="relative">
            <img
              src={`/logos/${t.symbol.toLowerCase()}.svg`}
              alt={t.symbol}
              className="h-11 w-11 rounded-full ring-2 ring-white/40 bg-white"
              draggable={false}
            />
            <button
              onClick={() => onRemove(t.symbol)}
              className="absolute -top-2 -right-2 text-xs bg-black/70 rounded-full px-1"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes boatBob {
          0% { transform: translateY(0px) rotate(0.5deg) }
          50% { transform: translateY(4px) rotate(-0.6deg) }
          100% { transform: translateY(0px) rotate(0.5deg) }
        }
        .boat-bob { animation: boatBob 3.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
