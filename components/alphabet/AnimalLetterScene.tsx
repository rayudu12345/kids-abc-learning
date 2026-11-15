import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { AnimatedAnimal } from "../../AnimalArt";
import { animalMotion } from "../../data/animalMotion";
import useAnimationEnabled from "../../hooks/useAnimationEnabled";

/** Large offline animal artwork with a simple habitat; never stretched or flipped. */
export default function AnimalLetterScene({
  letter,
  width,
  height,
}: {
  letter: string;
  width: number;
  height: number;
}) {
  const profile = animalMotion[letter];
  const active = useAnimationEnabled();
  const progress = useRef(new Animated.Value(0)).current;
  const scale = Math.min(width / 300, height / 220);
  useEffect(() => {
    progress.setValue(0);
    if (!active) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: profile.frameMs * profile.poses.length,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.stopAnimation();
    };
  }, [active, profile, progress]);
  return (
    <View
      testID="animal-letter-scene"
      accessible
      accessibilityLabel={`${profile.name}. ${profile.action}`}
      style={{ width, height, overflow: "hidden" }}
    >
      <View
        style={[
          styles.stage,
          {
            left: (width - 300) / 2,
            top: (height - 220) / 2,
            backgroundColor: profile.sky,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.ground, { backgroundColor: profile.ground }]} />
        {letter !== "F" && <View style={styles.shadow} />}
        {letter === "P" && <View style={styles.branch} />}
        {letter === "F" ? (
          <>
            {[20, 40, 258, 278].map((left, index) => (
              <View
                key={left}
                style={[
                  styles.seaweed,
                  {
                    left,
                    height: 38 + (index % 2) * 20,
                    transform: [{ rotate: index % 2 ? "12deg" : "-12deg" }],
                  },
                ]}
              />
            ))}
            {[0, 1, 2, 3].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.bubble,
                  {
                    left: 20 + index * 77,
                    top: 110 - index * 20,
                    opacity: active
                      ? progress.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.2, 0.8, 0.2],
                        })
                      : 0.65,
                    transform: [
                      {
                        translateY: active
                          ? progress.interpolate({ inputRange: [0, 1], outputRange: [35, -65] })
                          : 0,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </>
        ) : (
          <>
            <View style={[styles.bush, { left: -22 }]} />
            <View style={[styles.bush, { right: -16, height: 42 }]} />
            {[24, 47, 258, 277].map((left) => (
              <View key={left} style={[styles.grass, { left }]} />
            ))}
          </>
        )}
        <View style={styles.animal}>
          <AnimatedAnimal letter={letter} size={185} />
        </View>
        {letter === "E" &&
          [0, 1, 2, 3, 4].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.drop,
                {
                  left: 208 + index * 12,
                  top: 50 + index * 8,
                  opacity: active
                    ? progress.interpolate({
                        inputRange: [0, 0.25, 0.4, 0.55, 0.7, 1],
                        outputRange: [0, 0, 0.9, 0.8, 0, 0],
                      })
                    : 0.6,
                  transform: [
                    {
                      translateY: active
                        ? progress.interpolate({
                            inputRange: [0, 0.4, 0.7, 1],
                            outputRange: [-8, -8, 35, 35],
                          })
                        : 0,
                    },
                  ],
                },
              ]}
            />
          ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  stage: { position: "absolute", width: 300, height: 220, borderRadius: 24, overflow: "hidden" },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
  },
  animal: { position: "absolute", left: 57, top: 8 },
  shadow: {
    position: "absolute",
    left: 86,
    top: 175,
    width: 128,
    height: 12,
    borderRadius: 70,
    backgroundColor: "#465B37",
    opacity: 0.12,
  },
  bush: {
    position: "absolute",
    bottom: 36,
    width: 80,
    height: 58,
    borderRadius: 50,
    backgroundColor: "#83BD76",
    opacity: 0.6,
  },
  grass: {
    position: "absolute",
    bottom: 25,
    width: 4,
    height: 13,
    borderRadius: 4,
    backgroundColor: "#65A65C",
    transform: [{ rotate: "-18deg" }],
  },
  branch: {
    position: "absolute",
    left: 77,
    top: 175,
    width: 147,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#92633B",
    transform: [{ rotate: "-3deg" }],
  },
  seaweed: {
    position: "absolute",
    bottom: 22,
    width: 10,
    borderRadius: 12,
    backgroundColor: "#4AAB83",
  },
  bubble: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#E8FAFF",
  },
  drop: {
    position: "absolute",
    width: 6,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#389ED7",
    transform: [{ rotate: "25deg" }],
  },
});
