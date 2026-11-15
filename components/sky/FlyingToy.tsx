import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";
import {
  SkyMode,
  FlyingSpeed,
  balloonLetter,
  flyingLanes,
  flightDuration,
} from "../../skyPlayLogic";
import useFlyingMotion from "../../hooks/useFlyingMotion";
import { BalloonArt, KiteArt } from "./SkyArt";
import PopBurst from "./PopBurst";
type Lane = ReturnType<typeof flyingLanes>[number];
export default function FlyingToy({
  mode,
  lane,
  laneCount,
  height,
  paused,
  reducedMotion,
  speed,
  onHit,
}: {
  mode: SkyMode;
  lane: Lane;
  laneCount: number;
  height: number;
  paused: boolean;
  reducedMotion: boolean;
  speed: FlyingSpeed;
  onHit: () => void;
}) {
  const [burst, setBurst] = useState(false),
    [round, setRound] = useState(0);
  const hit = useRef(false);
  const progress = useFlyingMotion(
    !paused && !burst,
    flightDuration(lane.duration, speed),
    lane.phase,
  );
  useEffect(() => {
    if (reducedMotion) progress.setValue(lane.phase);
  }, [reducedMotion, progress, lane.phase]);
  const kite = mode === "kites",
    letter = balloonLetter(lane.id, round, laneCount);
  useEffect(() => {
    if (!burst) return;
    const timer = setTimeout(() => {
      progress.setValue(paused ? lane.phase : 0);
      setRound((value) => value + 1);
      hit.current = false;
      setBurst(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [burst, paused, lane.phase, progress]);
  const tap = () => {
    if (hit.current) return;
    hit.current = true;
    setBurst(true);
    onHit();
  };
  const y = kite
    ? progress.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [height * 0.4, 20, height * 0.25, 35, height * 0.4],
      })
    : progress.interpolate({ inputRange: [0, 1], outputRange: [height + 20, -170] });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: lane.x,
        top: 0,
        width: lane.width,
        height: 170,
        alignItems: "center",
        transform: [
          { translateY: y },
          { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 7, 0] }) },
          {
            rotate: kite
              ? progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ["-8deg", "10deg", "-8deg"],
                })
              : "0deg",
          },
        ],
      }}
    >
      {burst ? (
        <PopBurst kite={kite} reducedMotion={reducedMotion} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={kite ? `Tap kite ${lane.id + 1}` : `Pop balloon ${letter}`}
          onPress={tap}
          hitSlop={4}
          style={{ width: 90, height: 170 }}
        >
          {kite ? (
            <KiteArt color={lane.color} />
          ) : (
            <BalloonArt color={lane.color} letter={letter} />
          )}
        </Pressable>
      )}
    </Animated.View>
  );
}
