// The regular dodecahedron has 20 vertices and 30 equal-length edges.
export function dodecahedronEdges() {
  const phi = (1 + Math.sqrt(5)) / 2,
    vertices: number[][] = [];
  for (const x of [-1, 1])
    for (const y of [-1, 1]) for (const z of [-1, 1]) vertices.push([x, y, z]);
  for (const a of [-1, 1])
    for (const b of [-1, 1])
      vertices.push([0, a / phi, b * phi], [a / phi, b * phi, 0], [b * phi, 0, a / phi]);
  const projected = vertices.map(([x, y, z]) => ({
    x: 150 + (x * 0.86 + z * 0.5) * 52,
    y: 105 + (y * 0.9 - z * 0.35 + x * 0.2) * 52,
  }));
  const edges: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
  vertices.forEach((a, i) =>
    vertices.forEach((b, j) => {
      if (j > i && Math.abs(Math.hypot(...a.map((v, k) => v - b[k])) - 2 / phi) < 0.001)
        edges.push({ a: projected[i], b: projected[j] });
    }),
  );
  return edges;
}
