import { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const STEP = 0.5;

function ImageViewer({ images, index, onClose, onChange }) {

  const count = images.length;

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const moved = useRef(false);


  // ---------------- ZOOM ----------------

  const zoomBy = (delta) =>
    setZoom((prev) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta))
    );

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Back to the centre whenever zoom returns to 100%
  useEffect(() => {
    if (zoom === 1) setOffset({ x: 0, y: 0 });
  }, [zoom]);

  // Reset zoom when moving to another image
  useEffect(() => {
    resetZoom();
  }, [index]);


  // ---------------- NAVIGATION ----------------

  const showPrev = () => onChange((index - 1 + count) % count);
  const showNext = () => onChange((index + 1) % count);


  // ---------------- KEYBOARD ----------------

  useEffect(() => {

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "+" || e.key === "=") zoomBy(STEP);
      if (e.key === "-") zoomBy(-STEP);
      if (e.key === "0") resetZoom();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [index, count]);


  // Stop the page behind from scrolling while the viewer is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);


  // ---------------- DRAG TO PAN ----------------

  const handleMouseDown = (e) => {
    if (zoom === 1) return;
    e.preventDefault();
    moved.current = false;
    setDragging(true);
    dragStart.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    moved.current = true;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDragging = () => setDragging(false);


  const toolbarButton =
    "flex h-9 min-w-9 items-center justify-center rounded-full bg-white/10 px-3 text-lg text-white transition hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10";


  return (

    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !moved.current) onClose();
      }}
    >

      {/* CLOSE */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
      >
        ×
      </button>

      {/* COUNTER */}
      <p className="absolute top-7 left-1/2 -translate-x-1/2 text-sm text-white/80">
        {index + 1} / {count}
      </p>

      {/* PREVIOUS */}
      {count > 1 && (
        <button
          type="button"
          onClick={showPrev}
          aria-label="Previous image"
          className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
        >
          ‹
        </button>
      )}

      {/* IMAGE AREA */}
      <div
        className="flex h-[78vh] w-[90vw] max-w-4xl items-center justify-center overflow-hidden"
        onWheel={(e) => zoomBy(e.deltaY < 0 ? STEP : -STEP)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        <img
          src={images[index]}
          alt={`Product image ${index + 1}`}
          draggable={false}
          onDoubleClick={() => (zoom === 1 ? setZoom(2) : resetZoom())}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform 150ms ease-out",
            cursor:
              zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          }}
          className="max-h-full max-w-full select-none rounded-lg object-contain"
        />
      </div>

      {/* NEXT */}
      {count > 1 && (
        <button
          type="button"
          onClick={showNext}
          aria-label="Next image"
          className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
        >
          ›
        </button>
      )}

      {/* ZOOM TOOLBAR */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 p-2">

        <button
          type="button"
          onClick={() => zoomBy(-STEP)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={toolbarButton}
        >
          −
        </button>

        <span className="w-14 text-center text-sm text-white/90">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => zoomBy(STEP)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={toolbarButton}
        >
          +
        </button>

        <button
          type="button"
          onClick={resetZoom}
          disabled={zoom === 1}
          className={`${toolbarButton} text-sm`}
        >
          Reset
        </button>

      </div>

    </div>
  );
}

export default ImageViewer;