export type Point = { x: number; y: number };
export type TraceItem = {
  id: string;
  name: string;
  kind: "letter" | "lowercase" | "animal";
  icon: string;
  paths: Point[][];
  features?: Point[];
};
// Outline coordinates use a 300 × 300 drawing board.
const points = (...xy: number[]): Point[] =>
  Array.from({ length: xy.length / 2 }, (_, i) => ({ x: xy[i * 2], y: xy[i * 2 + 1] }));
const ellipseArc = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  start: number,
  end: number,
): Point[] => {
  const steps = Math.ceil(Math.abs(end - start) / 8);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((start + ((end - start) * i) / steps) * Math.PI) / 180;
    return { x: x + Math.cos(a) * rx, y: y + Math.sin(a) * ry };
  });
};
const letterPaths: Record<string, Point[][]> = {
  A: [points(65, 250, 150, 50, 235, 250), points(100, 170, 200, 170)],
  B: [
    points(80, 50, 80, 250),
    [
      ...points(80, 50, 135, 50),
      ...ellipseArc(135, 100, 65, 50, -90, 90),
      ...ellipseArc(135, 200, 75, 50, -90, 90),
      ...points(80, 250),
    ],
  ],
  C: [ellipseArc(155, 150, 85, 100, -45, -315)],
  D: [
    points(80, 50, 80, 250),
    [...points(80, 50, 90, 50), ...ellipseArc(90, 150, 140, 100, -90, 90), ...points(80, 250)],
  ],
  E: [
    points(80, 50, 80, 250),
    points(80, 50, 225, 50),
    points(80, 150, 200, 150),
    points(80, 250, 225, 250),
  ],
  F: [points(80, 50, 80, 250), points(80, 50, 225, 50), points(80, 150, 200, 150)],
  G: [[...ellipseArc(155, 150, 85, 100, -45, -315), ...points(225, 160, 160, 160)]],
  H: [points(80, 50, 80, 250), points(220, 50, 220, 250), points(80, 150, 220, 150)],
  I: [points(80, 50, 220, 50), points(150, 50, 150, 250), points(80, 250, 220, 250)],
  J: [
    points(100, 50, 230, 50),
    [...points(200, 50, 200, 200), ...ellipseArc(150, 200, 50, 50, 0, 180)],
  ],
  K: [points(80, 50, 80, 250), points(220, 50, 80, 150, 225, 250)],
  L: [points(80, 50, 80, 250, 225, 250)],
  M: [points(60, 250, 60, 50, 150, 165, 240, 50, 240, 250)],
  N: [points(75, 250, 75, 50, 225, 250, 225, 50)],
  O: [ellipseArc(150, 150, 85, 100, -90, 270)],
  P: [
    points(80, 50, 80, 250),
    [...points(80, 50, 135, 50), ...ellipseArc(135, 100, 75, 50, -90, 90), ...points(80, 150)],
  ],
  Q: [ellipseArc(150, 150, 85, 100, -90, 270), points(165, 195, 245, 260)],
  R: [
    points(80, 50, 80, 250),
    [...points(80, 50, 135, 50), ...ellipseArc(135, 100, 75, 50, -90, 90), ...points(80, 150)],
    points(135, 150, 230, 250),
  ],
  S: [[...ellipseArc(150, 100, 80, 50, -35, -270), ...ellipseArc(150, 200, 80, 50, -90, 145)]],
  T: [points(55, 50, 245, 50), points(150, 50, 150, 250)],
  U: [[...points(80, 50, 80, 200), ...ellipseArc(150, 200, 70, 50, 180, 0), ...points(220, 50)]],
  V: [points(65, 50, 150, 250, 235, 50)],
  W: [points(40, 50, 90, 250, 150, 120, 210, 250, 260, 50)],
  X: [points(65, 50, 235, 250), points(235, 50, 65, 250)],
  Y: [points(65, 50, 150, 150, 235, 50), points(150, 150, 150, 250)],
  Z: [points(65, 50, 235, 50, 65, 250, 235, 250)],
};
export const letterTraces: TraceItem[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  id: letter,
  name: letter,
  kind: "letter",
  icon: letter,
  paths: letterPaths[letter],
}));
const roundPoints = (cx: number, cy: number, radii: number[], count: number): Point[] =>
  Array.from({ length: count + 1 }, (_, i) => {
    const a = ((i % count) * Math.PI * 2) / count - Math.PI / 2;
    const r = radii[i % radii.length];
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });

const lowercasePaths: Record<string, Point[][]> = {
  a: [ellipseArc(140, 170, 60, 60, 0, 360), points(200, 110, 200, 230)],
  b: [points(80, 50, 80, 230), ellipseArc(140, 170, 60, 60, 180, 540)],
  c: [ellipseArc(150, 175, 65, 60, -45, -315)],
  d: [ellipseArc(130, 170, 60, 60, 0, 360), points(190, 50, 190, 230)],
  e: [[...points(85, 175, 215, 175), ...ellipseArc(150, 175, 65, 60, 0, -315)]],
  f: [
    [...points(120, 230, 120, 90), ...ellipseArc(145, 90, 25, 40, 180, 360)],
    points(90, 130, 175, 130),
  ],
  g: [
    ellipseArc(140, 165, 60, 55, 0, 360),
    [...points(200, 110, 200, 240), ...ellipseArc(160, 240, 40, 30, 0, 180)],
  ],
  h: [points(80, 50, 80, 230), [...ellipseArc(135, 170, 55, 55, 180, 360), ...points(190, 230)]],
  i: [points(150, 130, 150, 230), ellipseArc(150, 85, 4, 4, 0, 360)],
  j: [
    [...points(170, 130, 170, 240), ...ellipseArc(130, 240, 40, 30, 0, 180)],
    ellipseArc(170, 85, 4, 4, 0, 360),
  ],
  k: [points(80, 50, 80, 230), points(195, 115, 80, 175, 205, 230)],
  l: [points(150, 50, 150, 230)],
  m: [
    points(60, 120, 60, 230),
    [...ellipseArc(95, 170, 35, 55, 180, 360), ...points(130, 230)],
    [...ellipseArc(165, 170, 35, 55, 180, 360), ...points(200, 230)],
  ],
  n: [points(80, 120, 80, 230), [...ellipseArc(135, 170, 55, 55, 180, 360), ...points(190, 230)]],
  o: [ellipseArc(150, 175, 65, 60, -90, 270)],
  p: [points(80, 115, 80, 270), ellipseArc(140, 175, 60, 60, 180, 540)],
  q: [ellipseArc(140, 175, 60, 60, 0, 360), points(200, 115, 200, 270)],
  r: [points(100, 125, 100, 230), ellipseArc(145, 170, 45, 50, 180, 300)],
  s: [[...ellipseArc(155, 145, 55, 35, -35, -270), ...ellipseArc(155, 215, 55, 35, -90, 145)]],
  t: [
    [...points(150, 65, 150, 210), ...ellipseArc(175, 210, 25, 25, 180, 0)],
    points(100, 125, 200, 125),
  ],
  u: [
    [...points(80, 120, 80, 190), ...ellipseArc(135, 190, 55, 40, 180, 0)],
    points(190, 120, 190, 230),
  ],
  v: [points(80, 120, 150, 230, 220, 120)],
  w: [points(45, 120, 90, 230, 150, 155, 210, 230, 255, 120)],
  x: [points(90, 120, 210, 230), points(210, 120, 90, 230)],
  y: [points(80, 120, 150, 225, 220, 120), points(220, 120, 150, 255, 115, 270)],
  z: [points(90, 120, 210, 120, 90, 230, 210, 230)],
};
export const lowercaseTraces: TraceItem[] = "abcdefghijklmnopqrstuvwxyz"
  .split("")
  .map((letter) => ({
    id: letter,
    name: letter,
    kind: "lowercase",
    icon: letter,
    paths: lowercasePaths[letter],
  }));

export const animalTraces: TraceItem[] = [
  {
    id: "cat",
    name: "Cat",
    kind: "animal",
    icon: "🐱",
    paths: [
      [
        ...points(65, 125, 60, 55, 115, 90),
        ...ellipseArc(150, 145, 95, 80, -112, -68),
        ...points(240, 55, 235, 125),
        ...ellipseArc(150, 145, 95, 80, -15, 195),
      ],
    ],
    features: points(120, 145, 180, 145, 150, 175),
  },
  {
    id: "fish",
    name: "Fish",
    kind: "animal",
    icon: "🐠",
    paths: [[...ellipseArc(135, 150, 85, 65, 0, 360), ...points(265, 90, 265, 210, 220, 150)]],
    features: points(90, 135),
  },
  {
    id: "rabbit",
    name: "Rabbit",
    kind: "animal",
    icon: "🐇",
    paths: [
      [
        ...points(95, 125),
        ...ellipseArc(110, 80, 23, 55, 125, 415),
        ...points(140, 125, 160, 125),
        ...ellipseArc(190, 80, 23, 55, 125, 415),
        ...points(205, 125),
        ...ellipseArc(150, 165, 80, 75, -30, 210),
        ...points(95, 125),
      ],
    ],
    features: points(125, 165, 175, 165, 150, 190),
  },
  {
    id: "butterfly",
    name: "Butterfly",
    kind: "animal",
    icon: "🦋",
    paths: [
      [
        ...points(150, 145),
        ...ellipseArc(95, 105, 55, 55, 35, -270),
        ...ellipseArc(110, 200, 40, 45, -110, -320),
        ...points(150, 170),
      ],
      [
        ...points(150, 145),
        ...ellipseArc(205, 105, 55, 55, 145, 450),
        ...ellipseArc(190, 200, 40, 45, -70, 140),
        ...points(150, 170),
      ],
      points(150, 105, 150, 230),
    ],
  },
  {
    id: "dog",
    name: "Dog",
    kind: "animal",
    icon: "🐶",
    paths: [
      ellipseArc(150, 160, 75, 75, 0, 360),
      points(100, 105, 78, 70, 45, 95, 45, 200, 90, 180),
      points(200, 105, 222, 70, 255, 95, 255, 200, 210, 180),
    ],
    features: points(125, 150, 175, 150, 150, 180),
  },
  {
    id: "elephant",
    name: "Elephant",
    kind: "animal",
    icon: "🐘",
    paths: [
      ellipseArc(150, 140, 70, 75, 0, 360),
      ellipseArc(80, 145, 50, 70, 55, 305),
      ellipseArc(220, 145, 50, 70, -125, 125),
      points(160, 160, 160, 225, 180, 245, 205, 245, 225, 225),
    ],
    features: points(125, 130, 175, 130),
  },
  {
    id: "lion",
    name: "Lion",
    kind: "animal",
    icon: "🦁",
    paths: [roundPoints(150, 150, [110, 95], 24), ellipseArc(150, 150, 65, 70, 0, 360)],
    features: points(125, 135, 175, 135, 150, 170),
  },
  {
    id: "bear",
    name: "Bear",
    kind: "animal",
    icon: "🐻",
    paths: [
      ellipseArc(85, 80, 33, 33, 0, 360),
      ellipseArc(215, 80, 33, 33, 0, 360),
      ellipseArc(150, 160, 85, 80, 0, 360),
    ],
    features: points(120, 150, 180, 150, 150, 185),
  },
  {
    id: "panda",
    name: "Panda",
    kind: "animal",
    icon: "🐼",
    paths: [
      ellipseArc(85, 80, 33, 33, 0, 360),
      ellipseArc(215, 80, 33, 33, 0, 360),
      ellipseArc(150, 160, 85, 80, 0, 360),
      ellipseArc(115, 145, 23, 30, 0, 360),
      ellipseArc(185, 145, 23, 30, 0, 360),
    ],
    features: points(115, 145, 185, 145, 150, 185),
  },
  {
    id: "fox",
    name: "Fox",
    kind: "animal",
    icon: "🦊",
    paths: [
      points(
        70,
        135,
        65,
        50,
        125,
        95,
        175,
        95,
        235,
        50,
        230,
        135,
        250,
        155,
        150,
        250,
        50,
        155,
        70,
        135,
      ),
      points(70, 155, 120, 195, 150, 220, 180, 195, 230, 155),
    ],
    features: points(110, 150, 190, 150, 150, 220),
  },
  {
    id: "pig",
    name: "Pig",
    kind: "animal",
    icon: "🐷",
    paths: [
      ellipseArc(150, 160, 85, 80, 0, 360),
      points(80, 115, 65, 55, 125, 90),
      points(175, 90, 235, 55, 220, 115),
      ellipseArc(150, 185, 40, 27, 0, 360),
    ],
    features: points(120, 145, 180, 145, 135, 185, 165, 185),
  },
  {
    id: "cow",
    name: "Cow",
    kind: "animal",
    icon: "🐮",
    paths: [
      ellipseArc(150, 160, 70, 85, 0, 360),
      points(90, 110, 45, 85, 40, 130, 85, 145),
      points(210, 110, 255, 85, 260, 130, 215, 145),
      points(110, 85, 100, 40, 130, 75),
      points(170, 75, 200, 40, 190, 85),
      ellipseArc(150, 210, 50, 25, 0, 360),
    ],
    features: points(125, 145, 175, 145, 135, 210, 165, 210),
  },
  {
    id: "sheep",
    name: "Sheep",
    kind: "animal",
    icon: "🐑",
    paths: [roundPoints(150, 145, [105, 88], 32), ellipseArc(150, 165, 50, 65, 0, 360)],
    features: points(130, 150, 170, 150, 150, 185),
  },
  {
    id: "monkey",
    name: "Monkey",
    kind: "animal",
    icon: "🐵",
    paths: [
      ellipseArc(65, 150, 35, 45, 0, 360),
      ellipseArc(235, 150, 35, 45, 0, 360),
      ellipseArc(150, 150, 85, 90, 0, 360),
      [...ellipseArc(125, 145, 35, 40, -90, -270), ...ellipseArc(175, 145, 35, 40, 90, -90)],
    ],
    features: points(125, 145, 175, 145, 150, 180),
  },
  {
    id: "owl",
    name: "Owl",
    kind: "animal",
    icon: "🦉",
    paths: [
      [
        ...points(75, 125, 65, 55, 120, 90, 180, 90, 235, 55, 225, 125),
        ...ellipseArc(150, 150, 85, 100, -20, 200),
        ...points(75, 125),
      ],
      ellipseArc(115, 145, 30, 32, 0, 360),
      ellipseArc(185, 145, 30, 32, 0, 360),
      points(138, 180, 150, 200, 162, 180),
    ],
    features: points(115, 145, 185, 145),
  },
  {
    id: "penguin",
    name: "Penguin",
    kind: "animal",
    icon: "🐧",
    paths: [
      ellipseArc(150, 150, 80, 105, 0, 360),
      ellipseArc(150, 185, 50, 60, 0, 360),
      points(100, 240, 75, 265, 135, 260),
      points(165, 260, 225, 265, 200, 240),
    ],
    features: points(125, 105, 175, 105, 150, 130),
  },
  {
    id: "turtle",
    name: "Turtle",
    kind: "animal",
    icon: "🐢",
    paths: [
      ellipseArc(150, 165, 85, 65, 0, 360),
      ellipseArc(150, 65, 28, 35, 0, 360),
      points(90, 115, 45, 90, 35, 125, 65, 150),
      points(210, 115, 255, 90, 265, 125, 235, 150),
      points(85, 210, 65, 250, 105, 250, 120, 225),
      points(180, 225, 195, 250, 235, 250, 215, 210),
    ],
    features: points(140, 60, 160, 60),
  },
  {
    id: "snail",
    name: "Snail",
    kind: "animal",
    icon: "🐌",
    paths: [
      ellipseArc(125, 145, 75, 75, 0, 360),
      [...ellipseArc(125, 145, 48, 48, 0, -290), ...ellipseArc(125, 145, 24, 24, 70, -210)],
      points(55, 205, 35, 235, 225, 235, 250, 210, 250, 135, 225, 115, 205, 135, 205, 210),
      points(220, 120, 210, 80),
      points(240, 120, 255, 80),
    ],
    features: points(210, 80, 255, 80),
  },
  {
    id: "whale",
    name: "Whale",
    kind: "animal",
    icon: "🐳",
    paths: [
      [
        ...ellipseArc(130, 155, 95, 70, 20, 340),
        ...points(225, 120, 250, 85, 265, 115, 255, 145, 270, 165, 245, 175, 220, 180),
      ],
      points(120, 85, 110, 50, 95, 35),
      points(120, 85, 135, 45, 155, 35),
    ],
    features: points(75, 145),
  },
  {
    id: "dolphin",
    name: "Dolphin",
    kind: "animal",
    icon: "🐬",
    paths: [
      points(
        40,
        160,
        65,
        135,
        95,
        125,
        130,
        100,
        145,
        60,
        170,
        105,
        205,
        120,
        230,
        155,
        255,
        170,
        275,
        150,
        260,
        195,
        235,
        200,
        220,
        180,
        180,
        170,
        155,
        200,
        140,
        165,
        100,
        160,
        75,
        175,
        40,
        160,
      ),
    ],
    features: points(100, 135),
  },
  {
    id: "octopus",
    name: "Octopus",
    kind: "animal",
    icon: "🐙",
    paths: [
      [
        ...ellipseArc(150, 115, 75, 70, 180, 360),
        ...points(
          225,
          160,
          255,
          200,
          250,
          230,
          225,
          235,
          210,
          215,
          195,
          185,
          205,
          240,
          185,
          260,
          165,
          250,
          150,
          200,
          135,
          250,
          115,
          260,
          95,
          240,
          105,
          185,
          90,
          215,
          75,
          235,
          50,
          230,
          45,
          200,
          75,
          160,
          75,
          115,
        ),
      ],
    ],
    features: points(125, 115, 175, 115, 150, 145),
  },
  {
    id: "jellyfish",
    name: "Jellyfish",
    kind: "animal",
    icon: "🪼",
    paths: [
      [
        ...ellipseArc(150, 135, 95, 90, 180, 360),
        ...points(225, 155, 200, 135, 175, 155, 150, 135, 125, 155, 100, 135, 75, 155, 55, 135),
      ],
      points(95, 160, 85, 190, 105, 220, 90, 250),
      points(150, 160, 135, 195, 155, 225, 145, 260),
      points(205, 160, 190, 190, 210, 220, 195, 250),
    ],
    features: points(125, 105, 175, 105),
  },
  {
    id: "crab",
    name: "Crab",
    kind: "animal",
    icon: "🦀",
    paths: [
      ellipseArc(150, 170, 75, 50, 0, 360),
      points(80, 150, 50, 125, 35, 80, 60, 95, 75, 70, 80, 115, 100, 135),
      points(200, 135, 220, 115, 225, 70, 240, 95, 265, 80, 250, 125, 220, 150),
      points(85, 180, 45, 190, 30, 215),
      points(215, 180, 255, 190, 270, 215),
      points(110, 210, 80, 235),
      points(190, 210, 220, 235),
    ],
    features: points(125, 145, 175, 145),
  },
  {
    id: "bee",
    name: "Bee",
    kind: "animal",
    icon: "🐝",
    paths: [
      ellipseArc(150, 170, 65, 65, 0, 360),
      ellipseArc(95, 90, 50, 35, 0, 360),
      ellipseArc(205, 90, 50, 35, 0, 360),
      points(110, 130, 110, 210),
      points(150, 110, 150, 235),
      points(190, 130, 190, 210),
      points(125, 110, 110, 65),
      points(175, 110, 190, 65),
    ],
    features: points(130, 145, 170, 145),
  },
];
export function samplePath(vertices: Point[]): Point[] {
  const points = [vertices[0]];
  for (let i = 1; i < vertices.length; i++) {
    const a = vertices[i - 1],
      b = vertices[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
    for (let step = 1; step <= steps; step++)
      points.push({ x: a.x + ((b.x - a.x) * step) / steps, y: a.y + ((b.y - a.y) * step) / steps });
  }
  return points;
}
export const sampledStrokes = (item: TraceItem): Point[][] => item.paths.map(samplePath);

export const animalTraceIds = new Set(animalTraces.map((item) => item.id));
