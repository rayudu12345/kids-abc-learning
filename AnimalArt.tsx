import { motionRows, frameAtTick } from "./data/animalMotion";
import React, { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Image, View } from "react-native";
const atlas = require("./assets/animal-atlas.png");
const motionAtlas = require("./assets/animal-motion.png");
const cells: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, L: 4, P: 5, R: 6, Z: 7 };
export const animalLetters: Record<string, string> = {
  "🐱": "C",
  "🐶": "D",
  "🐘": "E",
  "🐠": "F",
  "🦁": "L",
  "🦜": "P",
  "🐇": "R",
  "🦓": "Z",
};
export function AnimalArt({ letter, size = 100 }: { letter: string; size?: number }) {
  const cell = cells[letter];
  if (cell === undefined) return null;
  // Intrinsic atlas dimensions; web Image does not expose resolveAssetSource.
  const sourceWidth = 1774,
    sourceHeight = 887;
  const cellWidth = sourceWidth / 4,
    cellHeight = sourceHeight / 2;
  const scale = Math.min(size / cellWidth, size / cellHeight);
  const w = cellWidth * scale,
    h = cellHeight * scale;
  return (
    <View
      pointerEvents="none"
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ width: w, height: h, overflow: "hidden" }}>
        <Image
          source={atlas}
          accessible={false}
          fadeDuration={0}
          style={{
            position: "absolute",
            width: sourceWidth * scale,
            height: sourceHeight * scale,
            left: -(cell % 4) * w,
            top: -Math.floor(cell / 4) * h,
          }}
        />
      </View>
    </View>
  );
}
export function AnimatedAnimal({
  letter,
  size = 100,
  animate = true,
}: {
  letter: string;
  size?: number;
  animate?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [active, setActive] = useState(
    AppState.currentState !== "background" && AppState.currentState !== "inactive",
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    setFrame(0);
    if (!animate || !active) return;
    const timer = setInterval(() => setFrame((value) => frameAtTick(value + 1)), 190);
    return () => clearInterval(timer);
  }, [letter, animate, active]);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (!animate || !active) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: letter === "R" ? 1700 : 2600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [letter, animate, active, progress]);
  const hop =
    letter === "R"
      ? -size * 0.09
      : letter === "F" || letter === "P"
        ? -size * 0.045
        : -size * 0.015;
  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, hop, 0] }),
          },
          {
            rotate: progress.interpolate({
              inputRange: [0, 0.25, 0.75, 1],
              outputRange: [
                "0deg",
                letter === "C" ? "-4deg" : "-1deg",
                letter === "C" ? "4deg" : "1deg",
                "0deg",
              ],
            }),
          },
          {
            scaleX: progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, letter === "P" ? 0.94 : 1.015, 1],
            }),
          },
        ],
      }}
    >
      {motionRows[letter] !== undefined ? (
        <View
          pointerEvents="none"
          testID="animal-motion-frame"
          accessibilityValue={{ now: frame, min: 0, max: 3 }}
          style={{ width: size, height: size, overflow: "hidden" }}
        >
          <Image
            source={motionAtlas}
            accessible={false}
            fadeDuration={0}
            style={{
              position: "absolute",
              width: size * 4,
              height: size * 8,
              left: -frame * size,
              top: -motionRows[letter] * size,
            }}
          />
        </View>
      ) : (
        <AnimalArt letter={letter} size={size} />
      )}
    </Animated.View>
  );
}
