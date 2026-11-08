import { letterTraces, sampledStrokes } from './traceCatalog';
import type { Point } from './traceCatalog';
export type { Point } from './traceCatalog';
export const tracingLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export type TraceLetter = string;
export function strokePoints(letter: TraceLetter): Point[][] {
  const item = letterTraces.find(item => item.id === letter);
  if (!item) throw new Error(`Unknown tracing letter: ${letter}`);
  return sampledStrokes(item);
}
// Accept nearby points in order. A fast finger movement is sampled so it
// works between native touch events without accepting a distant scribble.
export function advanceTrace(points: Point[], visited: number, point: Point, previous: Point | null): number {
  const start = previous ?? point;
  const steps = Math.max(1, Math.ceil(Math.hypot(point.x - start.x, point.y - start.y) / 8));
  let count = visited;
  for (let i = 1; i <= steps; i++) {
    const sample = { x: start.x + (point.x - start.x) * i / steps, y: start.y + (point.y - start.y) * i / steps };
    while (count < points.length && Math.hypot(sample.x - points[count].x, sample.y - points[count].y) <= 24) count++;
  }
  return count;
}
