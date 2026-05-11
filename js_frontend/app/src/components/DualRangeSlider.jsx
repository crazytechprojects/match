import { useState, useRef, useCallback, useEffect } from "react";

export default function DualRangeSlider({
  min = 18,
  max = 65,
  value = [22, 35],
  onChange,
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercent = useCallback(
    (val) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPosition = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return Math.round(min + percent * (max - min));
    },
    [min, max]
  );

  const handlePointerDown = useCallback(
    (thumb) => (e) => {
      e.preventDefault();
      setDragging(thumb);
    },
    []
  );

  useEffect(() => {
    if (dragging === null) return;

    const handlePointerMove = (e) => {
      const newVal = getValueFromPosition(e.clientX);
      setLocalValue((prev) => {
        const next = [...prev];
        if (dragging === 0) {
          next[0] = Math.min(newVal, prev[1] - 1);
        } else {
          next[1] = Math.max(newVal, prev[0] + 1);
        }
        return next;
      });
    };

    const handlePointerUp = () => {
      setDragging(null);
      setLocalValue((current) => {
        onChange?.(current);
        return current;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, getValueFromPosition, onChange]);

  const leftPercent = getPercent(localValue[0]);
  const rightPercent = getPercent(localValue[1]);

  return (
    <div className="w-full pt-2 pb-4">
      <div
        ref={trackRef}
        className="relative h-2 rounded-full bg-surface-700 cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        />

        {/* Left thumb */}
        <div
          onPointerDown={handlePointerDown(0)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 touch-none"
          style={{ left: `${leftPercent}%` }}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white border-2 border-primary-500 shadow-lg cursor-grab active:cursor-grabbing transition-shadow ${
              dragging === 0
                ? "ring-4 ring-primary-500/30 scale-110"
                : "hover:ring-4 hover:ring-primary-500/20"
            }`}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-surface-800 text-xs font-medium whitespace-nowrap">
            {localValue[0]}
          </div>
        </div>

        {/* Right thumb */}
        <div
          onPointerDown={handlePointerDown(1)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 touch-none"
          style={{ left: `${rightPercent}%` }}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white border-2 border-accent-500 shadow-lg cursor-grab active:cursor-grabbing transition-shadow ${
              dragging === 1
                ? "ring-4 ring-accent-500/30 scale-110"
                : "hover:ring-4 hover:ring-accent-500/20"
            }`}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-surface-800 text-xs font-medium whitespace-nowrap">
            {localValue[1]}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-3 text-xs text-surface-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
