export type FlyingSpeed = "gentle" | "playful";
export function flightDuration(duration: number, speed: FlyingSpeed) {
  return duration * (speed === "gentle" ? 1.6 : 1);
}
export type SkyMode = "balloons" | "kites";
export const skyColors = ["#E45376", "#398FD1", "#299D7C", "#9366CA", "#DF9533"];
export function flyingLanes(width: number) {
  const count = width >= 600 ? 5 : width >= 280 ? 3 : 2;
  const targetWidth = Math.min(96, (width - 16) / count - 4);
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    x: 8 + ((width - 16) * (index + 0.5)) / count - targetWidth / 2,
    width: targetWidth,
    phase: 0.3 + (index / (count - 1)) * 0.4,
    color: skyColors[index % skyColors.length],
    duration: 13000 + index * 950,
  }));
}
export function balloonLetter(lane: number, round: number, lanes: number) {
  return String.fromCharCode(65 + ((lane + round * lanes) % 26));
}
