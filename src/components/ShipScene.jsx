// src/components/ShipScene.jsx
export default function ShipScene({ children, sinking = false, beat = false, bpm = 100 }) {
  // период удара в секундах
  const beatDur = `${Math.max(0.25, 60 / bpm)}s`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a14] text-white">
      {/* фон */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(120%_100%_at_50%_100%,#081427_0%,#060a14_45%,#04070e_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #ffffff33 1px, transparent 1px), radial-gradient(1px 1px at 70% 60%, #ffffff22 1px, transparent 1px), radial-gradient(1px 1px at 40% 80%, #ffffff22 1px, transparent 1px)",
          backgroundSize: "3px 3px, 4px 4px, 3px 3px",
        }}
      />

      {/* волны */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 -z-10">
        <div className="absolute bottom-0 left-0 h-48 w-[200%] opacity-60" style={{ animation: 'waveMove 44s linear infinite' }}>
          <WaveSVG className="absolute bottom-0 left-0 w-1/2 h-48" />
          <WaveSVG className="absolute bottom-0 left-1/2 w-1/2 h-48" />
        </div>
        <div className="absolute bottom-0 left-0 h-48 w-[200%] opacity-40" style={{ animation: 'waveMove 66s linear infinite reverse' }}>
          <WaveSVG className="absolute bottom-0 left-0 w-1/2 h-48" />
          <WaveSVG className="absolute bottom-0 left-1/2 w-1/2 h-48" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#081427cc] to-transparent" />
      </div>

      {/* КОРАБЛЬ */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        {/* ВНЕШНЯЯ ОБЁРТКА С БИТОМ (не мешает нижнему sink-трансформу svg) */}
        <div
          className={`relative z-10 ${sinking ? '' : 'ship'} ${beat && sinking ? 'ship-beat' : ''} ${sinking ? 'ship-sink' : ''}`}
          style={{
            width: "clamp(900px, 78vw, 1600px)",
            transformOrigin: "center",
            animationDuration: beatDur, // для ship-beat
          }}
        >
          <svg viewBox="0 0 1400 400" className="w-full h-auto pointer-events-none">
            {/* базовый наклон */}
            <g transform="rotate(-10 700 200)">
              <path d="M850 260 Q1100 290 1300 265" stroke="#7ec8ff66" strokeWidth="10" fill="none" />
              <path d="M120 260 L1200 260 L1320 320 L200 320 Z" fill="#00000035"/>
              <path d="M180 200 L1100 200 L1220 260 L260 260 Z" fill="#10182a"/>
              <rect x="320" y="180" width="640" height="18" fill="#1e2537"/>
              {Array.from({length:16}).map((_,i)=>(
                <circle key={i} cx={340+i*40} cy="189" r="5" fill="#9fb3ff" opacity="0.85"/>
              ))}
              <rect x="460" y="140" width="360" height="36" rx="6" fill="#1f2b44"/>
              <g opacity="0.95">
                <rect x="520" y="100" width="28" height="40" fill="#39425a"/>
                <rect x="600" y="94" width="28" height="46" fill="#39425a"/>
                <rect x="680" y="100" width="28" height="40" fill="#39425a"/>
              </g>
              <g opacity="0.55">
                <ellipse cx="540" cy="80" rx="26" ry="12" fill="#9ca3af55" />
                <ellipse cx="610" cy="70" rx="24" ry="10" fill="#9ca3af3d" />
                <ellipse cx="690" cy="78" rx="22" ry="9" fill="#9ca3af44" />
              </g>
            </g>
          </svg>

          {/* палуба с токенами */}
          <div
            className={`absolute z-20 deck ${sinking ? 'deck-sink' : 'deck-tilt'}`}
            style={{ left:"20%", top:"28%", width:"60%", height:"12%" }}
          >
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes shipBob { 0%{transform:translateY(0)}50%{transform:translateY(6px)}100%{transform:translateY(0)} }
        .ship { animation: shipBob 4.5s ease-in-out infinite; }

        /* Вибрация под такт: короткий импульс на каждую долю */
        @keyframes shipBeatPulse {
          0%   { transform: translateY(0) rotate(0); }
          10%  { transform: translateY(2px) rotate(-0.6deg); }
          20%  { transform: translateY(-1px) rotate(0.6deg); }
          30%  { transform: translateY(1px) rotate(-0.4deg); }
          40%  { transform: translateY(0) rotate(0); }
          100% { transform: translateY(0) rotate(0); }
        }
        .ship-beat { animation-name: shipBeatPulse; animation-timing-function: ease; animation-iteration-count: infinite; }

        .deck { transition: transform .8s ease, opacity .8s ease; transform-origin:center; }
        .deck-tilt { transform: rotate(-10deg); }
        .ship-sink { /* отключаем bob, оставляем beat на обёртке */ }
        .deck-sink { transform: translateY(30vh) rotate(5deg); opacity: 0; transition: transform 7s ease-in, opacity 7s ease-in; }
        .ship-sink svg { transition: transform 7s ease-in, opacity 7s ease-in; }
        .ship-sink svg g { transform: translate(0,0); }
        .ship-sink svg { transform: translateY(45vh) rotate(-18deg); opacity: 0; }
      `}</style>
    </div>
  );
}

function WaveSVG({ className="" }) {
  return (
    <svg viewBox="0 0 800 200" preserveAspectRatio="none" className={className}>
      <path d="M0,120 C120,160 240,80 360,120 C480,160 600,80 720,120 L800,140 L800,200 L0,200 Z" fill="#0b254855" />
      <path d="M0,140 C120,180 240,100 360,140 C480,180 600,100 720,140 L800,160 L800,200 Z" fill="#174a7a66" />
    </svg>
  );
}
