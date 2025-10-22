export default function CapacityBar({ used, max }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>Boat capacity</span>
        <span>{used} / {max}</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className="h-3 bg-blue-400/80"
        />
      </div>
    </div>
  );
}
