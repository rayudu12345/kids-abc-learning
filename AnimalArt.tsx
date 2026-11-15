import { motionRows, animalMotion, animalPoseAtTick } from "./data/animalMotion";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, View } from "react-native";
import useAnimationEnabled from "./hooks/useAnimationEnabled";
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
  const active = useAnimationEnabled(animate);
  const profile = animalMotion[letter];
  useEffect(() => {
    setFrame(0);
    if (!active || !profile) return;
    let tick = 0;
    const timer = setInterval(() => setFrame(animalPoseAtTick(letter, ++tick)), profile.frameMs);
    return () => clearInterval(timer);
  }, [letter, active, profile]);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (!active || !profile) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: profile.frameMs * profile.poses.length,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [letter, active, profile, progress]);
  const sample = (values: number[]) =>
    progress.interpolate({
      inputRange: values.map((_, index) => index / (values.length - 1)),
      outputRange: values.map((value) => (value * size) / 180),
    });
  return (
    <Animated.View
      style={{
        transform: profile
          ? [
              { translateX: sample(profile.x) },
              { translateY: sample(profile.y) },
              {
                rotate: progress.interpolate({
                  inputRange: profile.tilt.map((_, index) => index / (profile.tilt.length - 1)),
                  outputRange: profile.tilt.map((value) => `${value}deg`),
                }),
              },
            ]
          : [],
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
