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
