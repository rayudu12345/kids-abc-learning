export type Point = { x: number; y: number };
export const tracingLetters = ['L', 'T', 'I'] as const;
export type TraceLetter = typeof tracingLetters[number];
const paths: Record<TraceLetter, Point[][]> = {
  L: [[{ x: 80, y: 45 }, { x: 80, y: 245 }, { x: 225, y: 245 }]],
  T: [[{ x: 55, y: 55 }, { x: 245, y: 55 }], [{ x: 150, y: 55 }, { x: 150, y: 245 }]],
  I: [[{ x: 80, y: 55 }, { x: 220, y: 55 }], [{ x: 150, y: 55 }, { x: 150, y: 245 }], [{ x: 80, y: 245 }, { x: 220, y: 245 }]],
};
export function strokePoints(letter: TraceLetter): Point[][] {
  return paths[letter].map(vertices => {
    const points = [vertices[0]];
    for (let i = 1; i < vertices.length; i++) {
      const a = vertices[i - 1], b = vertices[i];
      const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 10);
      for (let step = 1; step <= steps; step++) points.push({ x: a.x + (b.x - a.x) * step / steps, y: a.y + (b.y - a.y) * step / steps });
    }
    return points;
  });
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
