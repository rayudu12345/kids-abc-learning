export type Point = { x: number; y: number };
export type TraceItem = { id: string; name: string; kind: 'letter' | 'animal'; icon: string; paths: Point[][]; features?: Point[] };
const p = (...xy: number[]): Point[] => Array.from({ length: xy.length / 2 }, (_, i) => ({ x: xy[i * 2], y: xy[i * 2 + 1] }));
const arc = (x: number, y: number, rx: number, ry: number, start: number, end: number): Point[] => {
  const steps = Math.ceil(Math.abs(end - start) / 8);
  return Array.from({ length: steps + 1 }, (_, i) => { const a = (start + (end - start) * i / steps) * Math.PI / 180; return { x: x + Math.cos(a) * rx, y: y + Math.sin(a) * ry }; });
};
const paths: Record<string, Point[][]> = {
  A: [p(65,250,150,50,235,250),p(100,170,200,170)],
  B: [p(80,50,80,250),[...p(80,50,135,50),...arc(135,100,65,50,-90,90),...arc(135,200,75,50,-90,90),...p(80,250)]],
  C: [arc(155,150,85,100,-45,-315)],
  D: [p(80,50,80,250),[...p(80,50,90,50),...arc(90,150,140,100,-90,90),...p(80,250)]],
  E: [p(80,50,80,250),p(80,50,225,50),p(80,150,200,150),p(80,250,225,250)],
  F: [p(80,50,80,250),p(80,50,225,50),p(80,150,200,150)],
  G: [[...arc(155,150,85,100,-45,-315),...p(225,160,160,160)]],
  H: [p(80,50,80,250),p(220,50,220,250),p(80,150,220,150)],
  I: [p(80,50,220,50),p(150,50,150,250),p(80,250,220,250)],
  J: [p(100,50,230,50),[...p(200,50,200,200),...arc(150,200,50,50,0,180)]],
  K: [p(80,50,80,250),p(220,50,80,150,225,250)],
  L: [p(80,50,80,250,225,250)],
  M: [p(60,250,60,50,150,165,240,50,240,250)],
  N: [p(75,250,75,50,225,250,225,50)],
  O: [arc(150,150,85,100,-90,270)],
  P: [p(80,50,80,250),[...p(80,50,135,50),...arc(135,100,75,50,-90,90),...p(80,150)]],
  Q: [arc(150,150,85,100,-90,270),p(165,195,245,260)],
  R: [p(80,50,80,250),[...p(80,50,135,50),...arc(135,100,75,50,-90,90),...p(80,150)],p(135,150,230,250)],
  S: [[...arc(150,100,80,50,-35,-270),...arc(150,200,80,50,-90,145)]],
  T: [p(55,50,245,50),p(150,50,150,250)],
  U: [[...p(80,50,80,200),...arc(150,200,70,50,180,0),...p(220,50)]],
  V: [p(65,50,150,250,235,50)],
  W: [p(40,50,90,250,150,120,210,250,260,50)],
  X: [p(65,50,235,250),p(235,50,65,250)],
  Y: [p(65,50,150,150,235,50),p(150,150,150,250)],
  Z: [p(65,50,235,50,65,250,235,250)],
};
export const letterTraces: TraceItem[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({ id: letter, name: letter, kind: 'letter', icon: letter, paths: paths[letter] }));
export const animalTraces: TraceItem[] = [
  { id: 'cat', name: 'Cat', kind: 'animal', icon: '🐱', paths: [[...p(65,125,60,55,115,90),...arc(150,145,95,80,-112,-68),...p(240,55,235,125),...arc(150,145,95,80,-15,195)]], features: p(120,145,180,145,150,175) },
  { id: 'fish', name: 'Fish', kind: 'animal', icon: '🐠', paths: [[...arc(135,150,85,65,0,360),...p(265,90,265,210,220,150)]], features: p(90,135) },
  { id: 'rabbit', name: 'Rabbit', kind: 'animal', icon: '🐇', paths: [[...p(95,125),...arc(110,80,23,55,125,415),...p(140,125,160,125),...arc(190,80,23,55,125,415),...p(205,125),...arc(150,165,80,75,-30,210),...p(95,125)]], features: p(125,165,175,165,150,190) },
  { id: 'butterfly', name: 'Butterfly', kind: 'animal', icon: '🦋', paths: [[...p(150,145),...arc(95,105,55,55,35,-270),...arc(110,200,40,45,-110,-320),...p(150,170)], [...p(150,145),...arc(205,105,55,55,145,450),...arc(190,200,40,45,-70,140),...p(150,170)],p(150,105,150,230)] },
];
export function samplePath(vertices: Point[]): Point[] {
  const points = [vertices[0]];
  for (let i = 1; i < vertices.length; i++) {
    const a = vertices[i - 1], b = vertices[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
    for (let step = 1; step <= steps; step++) points.push({ x: a.x + (b.x - a.x) * step / steps, y: a.y + (b.y - a.y) * step / steps });
  }
  return points;
}
export const sampledStrokes = (item: TraceItem): Point[][] => item.paths.map(samplePath);
