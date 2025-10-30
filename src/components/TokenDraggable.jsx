export default function TokenDraggable({ token, pos }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", token.symbol);

    const img = new Image();
    img.src = /logos/${token.symbol.toLowerCase()}.svg;
    e.dataTransfer.setDragImage(img, 24, 24);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{ left: pos.left, top: pos.top }}
      title={${token.name} (${token.symbol})}
    >
      <div style={{ transform: "rotate(10deg)" }}>
        <img
          src={/logos/${token.symbol.toLowerCase()}.svg}
          className="rounded-full ring-2 ring-white/50 bg-white shadow"
          draggable={false}
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      </div>
    </div>
  );
}
