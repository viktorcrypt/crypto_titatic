// src/lib/deck.js
// Базовые X-позиции (в пикселях) вдоль палубы.
// Можно править как удобно — шум всё равно добавится поверх.
export const BASE_X = {
  BTC: 40,
  ETH: 110,
  SOL: 180,
  DOGE: 250,
  LINK: 320,
  LINEA: 390,
  MON: 460,
  PEPE: 530,
};

// простой детерминированный "хэш → 0..1"
function seed01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // приведение к 0..1
  return ((h >>> 0) % 10000) / 10000;
}

// jitterX: -14..+14 px, jitterY: 2..28 px (внутри палубы)
function jitterX(symbol) {
  const n = seed01(symbol + "_x");
  return Math.round((n * 28) - 14);
}
function jitterY(symbol) {
  const n = seed01(symbol + "_y");
  return Math.round(2 + n * 26);
}

/**
 * Возвращает позицию токена на палубе (уже с небольшим разноском).
 * left: px от левого края палубы
 * top:  px от верхнего края палубы
 */
export function deckPos(symbol) {
  const base = BASE_X[symbol] ?? 40;
  return {
    left: base + jitterX(symbol),
    top: jitterY(symbol),
  };
}
