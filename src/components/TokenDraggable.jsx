// src/components/TokenDraggable.jsx
// Перетаскиваемая иконка токена на палубе.
// ВАЖНО: контейнер палубы повернут на -10°, поэтому иконку компенсируем +10°,
// чтобы она выглядела ровной, но находилась "вдоль борта".
export default function TokenDraggable({ token, pos }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", token.symbol);
    // маленький drag image (иначе браузер рисует огромную тень)
    const img = new Image();
    img.src = `/logos/${token.symbol.toLowerCase()}.svg`;
    e.dataTransfer.setDragImage(img, 16, 16);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{ left: pos.left, top: pos.top }}
      title={`${token.name} (${token.symbol})`}
    >
      {/* Контр-поворот на +10°, потому что палуба повернута на -10° */}
      <div style={{ transform: "rotate(10deg)" }}>
        <img
          src={`/logos/${token.symbol.toLowerCase()}.svg`}
          className="h-10 w-10 rounded-full ring-2 ring-white/50 bg-white shadow"
          draggable={false}
        />
      </div>
    </div>
  );
}
