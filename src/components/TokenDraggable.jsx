export default function TokenDraggable({ token, pos }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", token.symbol);
    
    const img = new Image();
    img.src = /logos/${token.symbol.toLowerCase()}.svg;
    e.dataTransfer.setDragImage(img, 16, 16);
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
          className="h-10 w-10 rounded-full ring-2 ring-white/50 bg-white shadow"
          draggable={false}
        />
      </div>
    </div>
  );
}
