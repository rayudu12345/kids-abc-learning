import { Point } from "./traceCatalog";
export const MAX_PAINT_DOTS = 1000;
export type PaintStroke = { color: string; size: number; points: Point[] };
export const paintColors = [
  { name: "Red", color: "#E45376", recording: "red" },
  { name: "Blue", color: "#398FD1", recording: "blue" },
  { name: "Yellow", color: "#F6C744", recording: "yellow" },
  { name: "Green", color: "#299D7C", recording: "green" },
  { name: "Purple", color: "#9366CA", recording: "purple" },
  { name: "Eraser", color: "#FFFFFF", recording: "" },
];
export function paintPoint(x: number, y: number): Point | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: Math.max(0, Math.min(300, x)), y: Math.max(0, Math.min(300, y)) };
}
/** Interpolate finger movements so fast strokes have no gaps; bound native view counts. */
export function extendPaint(points: Point[], next: Point, brush: number, budget: number): Point[] {
  if (budget <= 0 || !paintPoint(next.x, next.y)) return points;
  const target = paintPoint(next.x, next.y)!;
  if (!points.length) return [target];
  const previous = points[points.length - 1];
  const distance = Math.hypot(target.x - previous.x, target.y - previous.y);
  if (distance < 2) return points;
  const steps = Math.max(1, Math.ceil(distance / Math.max(3, brush * 0.22)));
  const count = Math.min(steps, budget);
  const added = Array.from({ length: count }, (_, index) => ({
    x: previous.x + ((target.x - previous.x) * (index + 1)) / steps,
    y: previous.y + ((target.y - previous.y) * (index + 1)) / steps,
  }));
  return [...points, ...added];
}
