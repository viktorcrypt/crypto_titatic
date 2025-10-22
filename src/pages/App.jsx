// src/pages/App.jsx
import { useEffect, useRef, useState } from "react";
import ShipScene from "../components/ShipScene.jsx";
import TokenDraggable from "../components/TokenDraggable.jsx";
import LifeboatDrop from "../components/LifeboatDrop.jsx";
import { TOKENS, CAPACITY } from "../lib/tokens.js";
import { deckPos } from "../lib/deck.js";
import PostRescuePanel from "../components/PostRescuePanel.jsx"; 

const BOAT_CAPACITY = CAPACITY;
const PHONK_BPM = 110; 


function fadeAudio(el, { to = 0, ms = 7000 }) { 
  const from = el.volume ?? 0.5;
  const steps = 60; 
  const dt = ms / steps;
  let i = 0;
  const id = setInterval(() => {
    i++;
    const v = from + (to - from) * (i / steps);
    el.volume = Math.max(0, Math.min(1, v));
    if (i >= steps) {
      clearInterval(id);
      if (to === 0) el.pause?.();
    }
  }, dt);
}

export default function AppPage() {
  const [boat, setBoat] = useState([]);
  const [sinking, setSinking] = useState(false);
  const [rescueDone, setRescueDone] = useState(false); 
  const [showRecord, setShowRecord] = useState(false);  
  const stormRef = useRef(null);
  const phonkRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const storm = stormRef.current;
    if (storm) {
      storm.volume = 0.25;
      storm.loop = true;
      storm.play().catch(() => {});
    }
  }, []);

  const getToken = (s) => TOKENS.find((t) => t.symbol === s);
  const isAlready = (s) => boat.some((t) => t.symbol === s);
  const used = () => boat.reduce((s, t) => s + t.weight, 0);

  function onDrop(symbol) {
    if (sinking) return;
    if (isAlready(symbol)) return;
    const t = getToken(symbol);
    if (!t) return;
    if (used() + t.weight > BOAT_CAPACITY) return;
    setBoat((b) => [...b, t]);
  }

  function onRemove(symbol) {
    if (sinking) return;
    setBoat((b) => b.filter((x) => x.symbol !== symbol));
  }

  async function handleRescue() {
    if (boat.length === 0 || sinking) return;

    const storm = stormRef.current;
    const phonk = phonkRef.current;

   
    setRescueDone(true);

    
    if (phonk) {
      phonk.loop = true;
      try {
        phonk.volume = 0.0;
        await phonk.play();
        fadeAudio(phonk, { to: 0.6, ms: 7000 });
      } catch (_) {}
    }

    
    if (storm) {
      fadeAudio(storm, { to: 0, ms: 7000 });
    }

    
    setSinking(true);

    
    setTimeout(() => setShowRecord(true), 7200);
  }

  
  const getSymbols = () => boat.map((b) => b.symbol);
  function onRecorded() {
    
  }
  function onShowStats() {
    
    alert("Лидерборд спасённых (Envio) — добавим дальше 👍");
  }
  function onDelegate() {
    
    alert("Делегирование агенту — добавим дальше 👍");
  }

  return (
    <div className="relative">
      
      <ShipScene sinking={sinking} beat={true} bpm={PHONK_BPM}>
        {/* mute */}
        <div className="absolute right-6 top-6 z-[200]" style={{ transform: "rotate(10deg)" }}>
          <button
            onClick={() => {
              const storm = stormRef.current;
              const phonk = phonkRef.current;
              const next = !muted;
              setMuted(next);
              if (storm) storm.muted = next;
              if (phonk) phonk.muted = next;
              
              if (!next && rescueDone && phonk && phonk.paused) {
                phonk.play().catch(() => {});
              }
              
              if (!next && !rescueDone && storm && storm.paused) {
                storm.play().catch(() => {});
              }
            }}
            className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1 text-sm"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>

       
        <audio ref={stormRef} src="/sfx/storm.mp3" preload="auto" />
        <audio ref={phonkRef} src="/sfx/phonkmusic.mp3" preload="auto" />

        
        {!sinking &&
          TOKENS.filter((t) => !isAlready(t.symbol)).map((t) => (
            <TokenDraggable key={t.symbol} token={t} pos={deckPos(t.symbol)} />
          ))}

        
        <div
          className={`absolute left-1/2 top-[47vh] -translate-x-1/2 z-[150] transition-transform duration-[7000ms] ease-in-out ${
            sinking ? "translate-x-[400px] translate-y-[-60px]" : ""
          }`} 
          style={{ transform: "translateX(-50%) rotate(10deg)" }}
        >
          <LifeboatDrop
            picked={boat}
            capacity={BOAT_CAPACITY}
            onDrop={onDrop}
            onRemove={onRemove}
            svgSrc="/boats/boat.svg"
            width={560}
            rocking={!sinking}
          />

          <div className="mt-2 text-xs text-white/80 text-center" style={{ transform: "rotate(-10deg)" }}>
            Capacity: {used()}/{BOAT_CAPACITY}
          </div>

          <div className="mt-3 flex justify-center" style={{ transform: "rotate(-10deg)" }}>
            <button
              className="rounded-xl px-6 py-3 bg-blue-500 hover:bg-blue-600 shadow disabled:opacity-40"
              onClick={handleRescue}
              disabled={boat.length === 0}
            >
              Спасти выбранные
            </button>
          </div>
        </div>

        
        {rescueDone && (
          <img
            src="/troll.png"
            className="fixed bottom-8 right-8 w-28 h-28 z-[300] animate-troll-vibe pointer-events-none select-none"
            alt="trollface"
          />
        )}
      </ShipScene>

      
      <div className="fixed inset-x-0 bottom-6 z-[200] flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-black/40 border border-white/15 px-4 py-2 backdrop-blur">
          <span className="text-sm text-white/80">
            Capacity: {used()}/{BOAT_CAPACITY}
          </span>
          <button
            onClick={handleRescue}
            disabled={boat.length === 0}
            className="rounded-xl px-5 py-2 bg-blue-500 hover:bg-blue-600 shadow disabled:opacity-40"
          >
            SAVE COIN
          </button>
        </div>
      </div>

      
      <PostRescuePanel
        open={showRecord}
        getSymbols={() => boat.map((b) => b.symbol)}
        onRecorded={() => {}}
        onShowStats={onShowStats}
        onDelegate={onDelegate}
      />

      <style>{`
        @keyframes trollVibe {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(-4px, 2px) rotate(-2deg); }
          50% { transform: translate(3px, -3px) rotate(2deg); }
          75% { transform: translate(-2px, 3px) rotate(-3deg); }
        }
        .animate-troll-vibe {
          animation: trollVibe 0.25s infinite; /* чуть медленнее, чтобы не мельтешило */
        }
      `}</style>
    </div>
  );
}
