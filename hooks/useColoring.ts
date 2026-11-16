import { useRef, useState } from "react";
import {
  PaintStroke,
  paintColors,
  paintPoint,
  extendPaint,
  MAX_PAINT_DOTS,
} from "../coloringLogic";
export default function useColoring() {
  const [animal, setAnimal] = useState("cat"),
    [color, setColor] = useState(paintColors[0]);
  const [brush, setBrush] = useState(24),
    [marks, setMarks] = useState<PaintStroke[]>([]);
  const [draft, setDraft] = useState<PaintStroke | null>(null);
  const current = useRef<PaintStroke[]>([]),
    stroke = useRef<PaintStroke | null>(null);
  const pictures = useRef<Record<string, PaintStroke[]>>({});
  const lastClear = useRef<PaintStroke[] | null>(null);
  const total =
    marks.reduce((count, item) => count + item.points.length, 0) + (draft?.points.length ?? 0);
  const update = (next: PaintStroke[]) => {
    current.current = next;
    pictures.current[animal] = next;
    setMarks(next);
  };
  const end = () => {
    if (stroke.current?.points.length) update([...current.current, stroke.current]);
    stroke.current = null;
    setDraft(null);
  };
  const start = (x: number, y: number) => {
    const point = paintPoint(x, y);
    if (
      !point ||
      current.current.reduce((count, item) => count + item.points.length, 0) >= MAX_PAINT_DOTS
    )
      return;
    stroke.current = { color: color.color, size: brush, points: [point] };
    setDraft(stroke.current);
  };
  const move = (x: number, y: number) => {
    if (!stroke.current) return;
    const used =
      current.current.reduce((count, item) => count + item.points.length, 0) +
      stroke.current.points.length;
    stroke.current = {
      ...stroke.current,
      points: extendPaint(
        stroke.current.points,
        { x, y },
        stroke.current.size,
        MAX_PAINT_DOTS - used,
      ),
    };
    setDraft(stroke.current);
  };
  const selectAnimal = (id: string) => {
    stroke.current = null;
    setDraft(null);
    lastClear.current = null;
    current.current = pictures.current[id] ?? [];
    setMarks(current.current);
    setAnimal(id);
  };
  const undo = () => {
    if (current.current.length) update(current.current.slice(0, -1));
    else if (lastClear.current) {
      update(lastClear.current);
      lastClear.current = null;
    }
  };
  const clear = () => {
    if (current.current.length) {
      lastClear.current = current.current;
      update([]);
    }
  };
  return {
    animal,
    selectAnimal,
    color,
    setColor,
    brush,
    setBrush,
    marks,
    draft,
    start,
    move,
    end,
    undo,
    clear,
    total,
    canUndo: marks.length > 0 || Boolean(lastClear.current),
  };
}
