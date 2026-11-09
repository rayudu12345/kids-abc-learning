export type DropBox = { x: number; y: number; width: number; height: number };
// Both measurements and finger positions are in window coordinates.
export function findDropTarget(
  boxes: Record<string, DropBox>,
  x: number,
  y: number,
): string | undefined {
  return Object.entries(boxes).find(
    ([, b]) =>
      b.width > 0 &&
      b.height > 0 &&
      x >= b.x &&
      x <= b.x + b.width &&
      y >= b.y &&
      y <= b.y + b.height,
  )?.[0];
}
