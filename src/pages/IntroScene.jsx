// src/pages/IntroScene.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LINE_DURATION = 3800;     // время показа одной строки (мс)
const OUTRO_FADE = 1200;        // длительность затемнения перед сценой корабля (мс)
const AFTER_LAST_HOLD = 800;    // пауза после последней строки (мс)

export default function IntroScene() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const stormRef = useRef(null);
  const creakRef = useRef(null);

  const lines = [
    "The year is 2025.",
    "The great crypto ship is sinking…",
    "Billions in tokens are going down with it.",
    "Only one lifeboat remains.",
    "Who will you save?",
  ];

  // Пошаговая смена строк
  useEffect(() => {
    if (exiting) return;
    if (step < lines.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), LINE_DURATION);
      return () => clearTimeout(t);
    } else {
      // финальная пауза и плавный уход
      const t = setTimeout(() => startExit(), AFTER_LAST_HOLD);
      return () => clearTimeout(t);
    }
  }, [step, exiting]);

  function startExit() {
    setExiting(true);
    // плавно заглушаем звук
    fadeAudioOut(stormRef.current, 0.6 * OUTRO_FADE);
    fadeAudioOut(creakRef.current, 0.6 * OUTRO_FADE);
    // и после фейда — уходим на сцену корабля
    setTimeout(() => navigate("/app"), OUTRO_FADE);
  }

  // Звук: мягкий запуск + мелкие эффекты
  useEffect(() => {
    const storm = stormRef.current;
    const creak = creakRef.current;
    if (storm) {
      storm.volume = 0.22;
      storm.play().catch(() => {});
    }
    if (creak) {
      creak.volume = 0.14;
      const once = setTimeout(() => creak.play().catch(() => {}), 1200);
      const twice = setTimeout(() => creak.play().catch(() => {}), 5200);
      return () => {
        clearTimeout(once);
        clearTimeout(twice);
      };
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#060a14] text-white">
      {/* фон: небо/звёзды */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(120%_100%_at_50%_100%,#081427_0%,#060a14_45%,#04070e_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, #ffffff44 1px, transparent 1px), radial-gradient(1px 1px at 70% 60%, #ffffff22 1px, transparent 1px), radial-gradient(1px 1px at 40% 80%, #ffffff33 1px, transparent 1px)",
          backgroundSize: "3px 3px, 4px 4px, 3px 3px",
        }}
      />

      {/* волны */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 -z-10">
        <Wave className="opacity-70" speed={44} />
        <Wave className="opacity-40" speed={66} reverse />
      </div>

      {/* корабль (силуэт) — крупнее */}
      <motion.div
        className="absolute left-1/2 top-[14%] w-[1100px] -translate-x-1/2"
        animate={{ rotate: [-7, -9, -7], y: [0, 4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShipSilhouette />
      </motion.div>

      {/* титры */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="px-6 text-center">
          <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tight">
            Crypto Titanic
          </h1>

          <AnimatePresence mode="popLayout">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.9 }}
              className="mx-auto max-w-4xl text-2xl md:text-4xl lg:text-5xl font-light text-white/90 leading-snug"
              style={{ letterSpacing: "0.01em" }}
            >
              {lines[step]}
            </motion.p>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={startExit}
              className="rounded-xl bg-white/10 px-6 py-3 text-sm backdrop-blur transition hover:bg-white/15 border border-white/15"
            >
              Skip intro →
            </button>
          </div>
        </div>
      </div>

      {/* затемнение при уходе */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 1 : 0 }}
        transition={{ duration: OUTRO_FADE / 1000 }}
      />

      {/* аудио */}
      <audio ref={stormRef} src="/sfx/storm.mp3" preload="auto" loop />
      <audio ref={creakRef} src="/sfx/creak.mp3" preload="auto" />

      {/* keyframes для волн */}
      <style>{`
        @keyframes waveMove { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}

function ShipSilhouette() {
  return (
    <svg viewBox="0 0 860 260" className="w-full h-auto">
      {/* дым */}
      <motion.g
        animate={{ opacity: [0.2, 0.5, 0.2], y: [-6, -16, -6] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="320" cy="30" rx="24" ry="11" fill="#9ca3af55" />
        <ellipse cx="360" cy="24" rx="20" ry="9" fill="#9ca3af3d" />
        <ellipse cx="400" cy="28" rx="19" ry="8" fill="#9ca3af44" />
      </motion.g>
      {/* блики воды */}
      <path d="M540 170 Q680 188 820 170" stroke="#7ec8ff66" strokeWidth="6" fill="none" />
      {/* корпус */}
      <path d="M100 120 L700 120 L760 160 L140 160 Z" fill="#0f172a"/>
      {/* бортик + иллюминаторы */}
      <rect x="160" y="110" width="470" height="16" fill="#1e2434"/>
      {Array.from({length:12}).map((_,i)=>(
        <circle key={i} cx={180+i*40} cy="118" r="4" fill="#9fb3ff" opacity="0.8"/>
      ))}
      {/* надстройка */}
      <rect x="250" y="78" width="240" height="30" rx="4" fill="#1e293b"/>
      {/* трубы */}
      <g opacity="0.95">
        <rect x="300" y="48" width="24" height="36" fill="#374151"/>
        <rect x="360" y="44" width="24" height="40" fill="#374151"/>
        <rect x="420" y="48" width="24" height="36" fill="#374151"/>
      </g>
    </svg>
  );
}

function Wave({ className = "", speed = 40, reverse = false }) {
  return (
    <div className={`absolute inset-x-0 bottom-0 h-1/2 ${className}`}>
      <div
        className="absolute bottom-0 left-0 h-48 w-[200%] opacity-90"
        style={{
          animation: `waveMove ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <WaveSVG className="absolute bottom-0 left-0 w-1/2 h-48" />
        <WaveSVG className="absolute bottom-0 left-1/2 w-1/2 h-48" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#081427cc] to-transparent" />
    </div>
  );
}

function WaveSVG({ className = "" }) {
  return (
    <svg viewBox="0 0 800 200" preserveAspectRatio="none" className={className}>
      <path d="M0,120 C120,160 240,80 360,120 C480,160 600,80 720,120 L800,140 L800,200 L0,200 Z" fill="#0b254855" />
      <path d="M0,140 C120,180 240,100 360,140 C480,180 600,100 720,140 L800,160 L800,200 L0,200 Z" fill="#174a7a66" />
    </svg>
  );
}

/* helpers */
function fadeAudioOut(audioEl, durationMs = 800) {
  if (!audioEl) return;
  const start = audioEl.volume ?? 0.2;
  const steps = 12;
  const delta = start / steps;
  const tick = durationMs / steps;
  let i = 0;
  const id = setInterval(() => {
    i++;
    audioEl.volume = Math.max(0, start - delta * i);
    if (i >= steps) {
      clearInterval(id);
      audioEl.pause?.();
    }
  }, tick);
}
