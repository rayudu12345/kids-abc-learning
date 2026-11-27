import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";
import { animalMotion, animalPoseAtTick, motionRows } from "../../data/animalMotion";
const atlas = require("../../assets/animal-motion.png");
/** Briefly blend adjacent illustrated poses instead of abruptly replacing the whole animal. */
export default function AnimalMotionSprite({
  letter,
  size,
  active,
}: {
  letter: string;
  size: number;
  active: boolean;
}) {
  const [pose, setPose] = useState({ frame: 0, previous: 0 });
  const blend = useRef(new Animated.Value(1)).current;
  const lastFrame = useRef(0);
  const profile = animalMotion[letter];
  useEffect(() => {
    setPose({ frame: 0, previous: 0 });
    lastFrame.current = 0;
    blend.setValue(1);
    if (!active || !profile) return;
    let tick = 0;
    const timer = setInterval(() => {
      const frame = animalPoseAtTick(letter, ++tick);
      if (frame === lastFrame.current) return;
      const previous = lastFrame.current;
      lastFrame.current = frame;
      blend.stopAnimation();
      blend.setValue(0);
      setPose({ frame, previous });
      Animated.timing(blend, {
        toValue: 1,
        duration: Math.min(60, profile.frameMs / 2),
        useNativeDriver: true,
      }).start();
    }, profile.frameMs);
    return () => {
      clearInterval(timer);
      blend.stopAnimation();
    };
  }, [active, letter, profile, blend]);
  const art = (frame: number) => (
    <Image
      source={atlas}
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
  );
  return (
    <View
      pointerEvents="none"
      testID="animal-motion-frame"
      accessibilityValue={{ now: pose.frame, min: 0, max: 3 }}
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      {active && art(pose.previous)}
      <Animated.View
        testID="animal-current-pose"
        style={{ width: size, height: size, opacity: active ? blend : 1 }}
      >
        {art(active ? pose.frame : 0)}
      </Animated.View>
    </View>
  );
}
