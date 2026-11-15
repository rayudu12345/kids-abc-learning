export const motionRows: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  L: 4,
  P: 5,
  R: 6,
  Z: 7,
};
export const MOTION_FRAMES = 4;
export const frameAtTick = (tick: number) =>
  ((Math.floor(tick) % MOTION_FRAMES) + MOTION_FRAMES) % MOTION_FRAMES;

export type AnimalMotion = {
  name: string;
  action: string;
  frameMs: number;
  poses: number[];
  x: number[];
  y: number[];
  tilt: number[];
  sky: string;
  ground: string;
};
/** Pose order holds resting frames and returns naturally instead of snapping 3 → 0. */
export const animalMotion: Record<string, AnimalMotion> = {
  C: {
    name: "Cat",
    action: "Watch the cat lift its paw.",
    frameMs: 240,
    poses: [0, 0, 1, 2, 1, 0, 0, 0],
    x: [0, 0, 0],
    y: [0, -1, 0],
    tilt: [0, 0, 0],
    sky: "#FCE7DA",
    ground: "#D9EBC5",
  },
  D: {
    name: "Dog",
    action: "Watch the dog's tail wag!",
    frameMs: 150,
    poses: [0, 1, 2, 3, 0, 1, 2, 3],
    x: [0, 0, 0],
    y: [0, 1, 0],
    tilt: [0, 0, 0],
    sky: "#DDF4FF",
    ground: "#AEDD9F",
  },
  E: {
    name: "Elephant",
    action: "Up goes the trunk—splash!",
    frameMs: 280,
    poses: [0, 0, 1, 2, 2, 1, 0, 0],
    x: [0, 0, 0],
    y: [0, -1, 0],
    tilt: [0, 0, 0],
    sky: "#E2F4FF",
    ground: "#D9E5A6",
  },
  F: {
    name: "Fish",
    action: "Watch the fins move through the bubbles.",
    frameMs: 200,
    poses: [0, 1, 2, 3, 2, 1, 0, 0],
    x: [-15, 0, 15, 0, -15],
    y: [0, -4, 0, 4, 0],
    tilt: [0, -2, 0, 2, 0],
    sky: "#C8F1FF",
    ground: "#F6D9A1",
  },
  L: {
    name: "Lion",
    action: "The friendly lion opens its mouth for a soft roar.",
    frameMs: 300,
    poses: [0, 0, 1, 2, 1, 0, 0, 0],
    x: [0, 0, 0],
    y: [0, -1, 0],
    tilt: [0, 0, 0],
    sky: "#FFF0C9",
    ground: "#E1D399",
  },
  P: {
    name: "Parrot",
    action: "Watch the colorful wings open and close.",
    frameMs: 180,
    poses: [0, 1, 2, 1, 0, 1, 2, 1],
    x: [0, 0, 0],
    y: [0, -3, 0, -3, 0],
    tilt: [0, 0, 0],
    sky: "#DDF6E8",
    ground: "#B7DDA8",
  },
  R: {
    name: "Rabbit",
    action: "Crouch, hop, and land softly!",
    frameMs: 210,
    poses: [0, 0, 1, 2, 3, 0, 0, 0],
    x: [0, 0, 2, 5, 8, 5, 2, 0, 0],
    y: [0, 0, -2, -12, -3, 0, 0, 0, 0],
    tilt: [0, 0, 0],
    sky: "#EEE9FF",
    ground: "#BFE4AC",
  },
  Z: {
    name: "Zebra",
    action: "Watch the striped zebra trot.",
    frameMs: 190,
    poses: [0, 1, 2, 3, 0, 1, 2, 3],
    x: [0, 2, 0, -2, 0],
    y: [0, -2, 0, -2, 0],
    tilt: [0, 0, 0],
    sky: "#E7F5FF",
    ground: "#D8DF9E",
  },
};
export function animalPoseAtTick(letter: string, tick: number) {
  const poses = animalMotion[letter]?.poses ?? [0];
  return poses[((Math.floor(tick) % poses.length) + poses.length) % poses.length];
}
