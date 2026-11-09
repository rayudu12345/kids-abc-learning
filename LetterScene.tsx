import { AnimatedAnimal, animalLetters } from "./AnimalArt";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export const alphabet = [
  ["A", "Apple", "🍎", "Apple cuts into slices"],
  ["B", "Ball", "⚽", "Ball bounces"],
  ["C", "Cat", "🐱", "Cat waves and meows"],
  ["D", "Dog", "🐶", "Dog wags its tail"],
  ["E", "Elephant", "🐘", "Elephant sprays water"],
  ["F", "Fish", "🐠", "Fish swims through bubbles"],
  ["G", "Grapes", "🍇", "Grapes roll into a bowl"],
  ["H", "Hat", "🎩", "Hat spins and lands"],
  ["I", "Ice cream", "🍦", "Scoops stack onto a cone"],
  ["J", "Jelly", "🍮", "Jelly wiggles"],
  ["K", "Kite", "🪁", "Kite flies"],
  ["L", "Lion", "🦁", "Friendly lion gives a soft roar"],
  ["M", "Mango", "🥭", "Mango cuts open"],
  ["N", "Nest", "🪺", "Baby birds peek out"],
  ["O", "Orange", "🍊", "Orange peels into segments"],
  ["P", "Parrot", "🦜", "Parrot flaps its wings"],
  ["Q", "Queen", "👸", "Queen waves"],
  ["R", "Rabbit", "🐇", "Rabbit hops"],
  ["S", "Sun", "☀️", "Smiling sun rises"],
  ["T", "Train", "🚂", "Train moves along a track"],
  ["U", "Umbrella", "☂️", "Umbrella opens"],
  ["V", "Van", "🚐", "Van drives along a road"],
  ["W", "Watch", "⌚", "Watch hands move"],
  ["X", "X-ray", "🩻", "Cartoon hand reveals its bones"],
  ["Y", "Yo-yo", "🪀", "Yo-yo moves up and down"],
  ["Z", "Zebra", "🦓", "Zebra trots"],
];

// Each scene owns its timeline, so selecting a new letter stops the old loop.
export default function LetterScene({
  letter,
  width = 300,
  height = 200,
}: {
  letter: string;
  width?: number;
  height?: number;
}) {
  const scale = Math.min(width / 300, height / 200);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      progress.stopAnimation();
    };
  }, [progress]);
  const motion = (values: number[]) =>
    progress.interpolate({
      inputRange: values.map((_, i) => i / (values.length - 1)),
      outputRange: values,
    });
  const turn = (values: string[]) =>
    progress.interpolate({
      inputRange: values.map((_, i) => i / (values.length - 1)),
      outputRange: values,
    });
  const sprite = (symbol: string, x = 0, y = 0, size = 65, style: object = {}, key = symbol) =>
    animalLetters[symbol] ? (
      <Animated.View
        key={key}
        style={[{ position: "absolute", left: 112 + x, top: 17 + y }, style]}
      >
        <AnimatedAnimal letter={animalLetters[symbol]} size={size * 1.55} />
      </Animated.View>
    ) : (
      <Animated.Text
        key={key}
        style={[styles.sprite, { left: 110 + x, top: 35 + y, fontSize: size }, style]}
      >
        {symbol}
      </Animated.Text>
    );
  let content: React.ReactNode;
  switch (letter) {
    case "A":
    case "M":
    case "O": {
      const color = letter === "A" ? "#ef5350" : letter === "M" ? "#ffbd3e" : "#ff922b";
      const spread = motion([0, 0, 1, 1, 0]);
      content = (
        <>
          {letter === "A" ? (
            <Animated.View style={[styles.apple, { opacity: motion([1, 1, 0, 0, 1]) }]}>
              <View style={styles.appleLobe} />
              <View style={styles.appleStem} />
              <View style={styles.appleLeaf} />
              <View style={styles.appleShine} />
            </Animated.View>
          ) : (
            sprite(letter === "M" ? "🥭" : "🍊", 0, 0, 70, { opacity: motion([1, 1, 0, 0, 1]) })
          )}
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.slice,
                {
                  backgroundColor: color,
                  left: 130,
                  opacity: spread,
                  transform: [
                    { translateX: Animated.multiply(spread, (i - 1.5) * 38) },
                    { rotate: `${(i - 1.5) * 18}deg` },
                  ],
                },
              ]}
            />
          ))}
          {letter !== "O" &&
            sprite("🔪", 5, -28, 32, {
              opacity: motion([0, 1, 0, 0, 0]),
              transform: [{ translateY: motion([-15, 30, 30, -15, -15]) }],
            })}
        </>
      );
      break;
    }
    case "B":
      content = (
        <>
          <Animated.View
            style={[
              styles.ballShadow,
              {
                opacity: motion([0.3, 0.12, 0.3, 0.18, 0.3]),
                transform: [{ scaleX: motion([1, 0.6, 1, 0.75, 1]) }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ball,
              {
                transform: [
                  { translateY: motion([45, -20, 45, 0, 45]) },
                  { scaleX: motion([1.12, 0.98, 1.12, 1, 1.12]) },
                  { scaleY: motion([0.86, 1.05, 0.86, 1, 0.86]) },
                  { rotate: turn(["-15deg", "15deg", "-15deg"]) },
                ],
              },
            ]}
          >
            <View style={styles.ballStripe} />
            <View style={styles.ballSeam} />
            <View style={styles.ballShine} />
          </Animated.View>
          <View style={styles.ground} />
        </>
      );
      break;
    case "C":
      content = (
        <>
          {sprite("🐱")}
          <Text style={styles.bubble}>Meow! ♡</Text>
        </>
      );
      break;
    case "Q":
      content = (
        <>
          {sprite("👸")}
          {sprite("👋", 55, 5, 37, {
            transform: [{ rotate: turn(["-25deg", "25deg", "-25deg", "25deg", "-25deg"]) }],
          })}
        </>
      );
      break;
    case "D":
      content = sprite("🐶", 0, 0, 72, {
        transform: [{ rotate: turn(["-3deg", "3deg", "-3deg", "3deg", "-3deg"]) }],
      });
      break;
    case "E":
      content = (
        <>
          {sprite("🐘", -25)}
          {[0, 1, 2].map((i) =>
            sprite(
              "💧",
              55 + i * 17,
              -i * 12,
              24,
              {
                opacity: motion([0, 1, 1, 0]),
                transform: [
                  { translateX: motion([0, 22, 44]) },
                  { translateY: motion([0, -20, 30]) },
                ],
              },
              `drop${i}`,
            ),
          )}
        </>
      );
      break;
    case "F":
      content = (
        <>
          {[0, 1, 2, 3].map((i) =>
            sprite(
              "🫧",
              i * 55 - 85,
              25,
              28,
              { opacity: motion([0, 1, 0]), transform: [{ translateY: motion([30, -75]) }] },
              `bubble${i}`,
            ),
          )}
          {sprite("🐠", 0, 0, 65, {
            transform: [
              { translateX: motion([-85, 85, -85]) },
              { translateY: motion([0, -15, 0]) },
            ],
          })}
        </>
      );
      break;
    case "G":
      content = (
        <>
          {sprite("🥣", 35, 33)}
          {[0, 1, 2].map((i) =>
            sprite(
              "🍇",
              -75 - i * 18,
              -i * 8,
              32,
              {
                transform: [
                  { translateX: motion([0, 45, 110 + i * 18, 110 + i * 18]) },
                  { translateY: motion([0, 0, 35, 35]) },
                  { rotate: turn(["0deg", "360deg"]) },
                ],
              },
              `grape${i}`,
            ),
          )}
        </>
      );
      break;
    case "H":
      content = sprite("🎩", 0, 0, 65, {
        transform: [
          { translateY: motion([-45, -25, 25, 25]) },
          { rotate: turn(["0deg", "360deg", "720deg", "720deg"]) },
        ],
      });
      break;
    case "I":
      content = (
        <>
          <View style={styles.cone} />
          {["#f498b5", "#aa7150", "#fff4cb"].map((color, i) => (
            <Animated.View
              key={color}
              style={[
                styles.scoop,
                {
                  backgroundColor: color,
                  top: 66 - i * 23,
                  opacity: motion([0, i === 0 ? 1 : 0, 1, 1]),
                  transform: [{ translateY: motion([-65 - i * 20, -i * 20, 0, 0]) }],
                },
              ]}
            />
          ))}
        </>
      );
      break;
    case "J":
      content = sprite("🍮", 0, 0, 75, {
        transform: [
          { scaleX: motion([1, 1.22, 0.85, 1.15, 1]) },
          { scaleY: motion([1, 0.85, 1.15, 0.9, 1]) },
          { rotate: turn(["0deg", "-8deg", "8deg", "-5deg", "0deg"]) },
        ],
      });
      break;
    case "K":
      content = sprite("🪁", 0, 0, 70, {
        transform: [
          { translateX: motion([-70, 25, 70, -70]) },
          { translateY: motion([15, -30, -15, 15]) },
          { rotate: turn(["-15deg", "15deg", "-15deg"]) },
        ],
      });
      break;
    case "L":
      content = (
        <>
          {sprite("🦁", 0, 0, 70, { transform: [{ scale: motion([1, 1.13, 1, 1.08, 1]) }] })}
          <Text style={styles.bubble}>Roaaar! ♡</Text>
        </>
      );
      break;
    case "N":
      content = (
        <>
          {[0, 1].map((i) =>
            sprite(
              "🐤",
              i * 38 - 5,
              5,
              35,
              { transform: [{ translateY: motion([35, -12 - i * 5, 35]) }] },
              `bird${i}`,
            ),
          )}
          {sprite("🪹", 0, 34, 75)}
        </>
      );
      break;
    case "P":
      content = sprite("🦜", 0, 0, 72, {
        transform: [{ translateY: motion([0, -12, 0, -12, 0]) }],
      });
      break;
    case "R":
      content = sprite("🐇", 0, 0, 65, {
        transform: [
          { translateX: motion([-80, -40, 0, 40, 80]) },
          { translateY: motion([15, -30, 15, -30, 15]) },
        ],
      });
      break;
    case "S":
      content = (
        <>
          {sprite("☀️", 0, 0, 85, { transform: [{ translateY: motion([70, 0, -22, -22]) }] })}
          {sprite("😊", 22, 20, 35, { transform: [{ translateY: motion([70, 0, -22, -22]) }] })}
          <View style={[styles.ground, { backgroundColor: "#8ad3a3", height: 16 }]} />
        </>
      );
      break;
    case "T":
    case "V":
      content = (
        <>
          <View style={[styles.track, { borderStyle: letter === "T" ? "dashed" : "solid" }]} />
          {sprite(letter === "T" ? "🚂" : "🚐", 0, 12, 65, {
            transform: [{ translateX: motion([120, -120]) }],
          })}
        </>
      );
      break;
    case "U":
      content = (
        <>
          <View style={styles.handle} />
          {sprite("☂️", -10, -18, 90, { transform: [{ scaleX: motion([0.15, 1, 1, 0.15]) }] })}
        </>
      );
      break;
    case "W":
      content = (
        <>
          <View style={styles.strap} />
          <View style={styles.clock}>
            <Text style={styles.twelve}>12</Text>
            <Animated.View
              style={[styles.handPivot, { transform: [{ rotate: turn(["0deg", "360deg"]) }] }]}
            >
              <View style={styles.minute} />
            </Animated.View>
            <Animated.View
              style={[styles.handPivot, { transform: [{ rotate: turn(["35deg", "65deg"]) }] }]}
            >
              <View style={styles.hour} />
            </Animated.View>
            <View style={styles.clockDot} />
          </View>
        </>
      );
      break;
    case "X":
      content = (
        <>
          <View style={styles.xray}>
            <Text style={styles.palm}>✋</Text>
            <Animated.View style={[styles.bones, { opacity: motion([0, 1, 1, 0]) }]}>
              <View style={styles.fingers}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.bone, { height: 23 + (2 - Math.abs(i - 2)) * 7 }]} />
                ))}
              </View>
              <View style={styles.wrist} />
            </Animated.View>
            <Animated.View
              style={[styles.scan, { transform: [{ translateY: motion([0, 110, 0]) }] }]}
            />
          </View>
        </>
      );
      break;
    case "Y":
      content = (
        <>
          <Animated.View
            style={[styles.string, { transform: [{ scaleY: motion([0.2, 1, 0.2]) }] }]}
          />
          {sprite("🪀", 0, 0, 55, {
            transform: [
              { translateY: motion([-30, 55, -30]) },
              { rotate: turn(["0deg", "360deg", "0deg"]) },
            ],
          })}
        </>
      );
      break;
    case "Z":
      content = (
        <>
          {sprite("🦓", 0, 5, 65, {
            transform: [
              { translateX: motion([100, -100]) },
              { translateY: motion([0, -10, 0, -10, 0, -10, 0]) },
              { rotate: turn(["-4deg", "4deg", "-4deg", "4deg", "-4deg"]) },
            ],
          })}
          <View style={styles.ground} />
        </>
      );
      break;
    default:
      content = null;
  }
  return (
    <View
      style={{ width, height, overflow: "hidden" }}
      accessible
      accessibilityLabel={alphabet.find((item) => item[0] === letter)?.[3]}
    >
      <View
        style={[
          styles.stage,
          {
            position: "absolute",
            left: (width - 300) / 2,
            top: (height - 200) / 2,
            transform: [{ scale }],
          },
        ]}
      >
        {content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: 300, height: 200, overflow: "hidden" },
  apple: {
    position: "absolute",
    left: 104,
    top: 35,
    width: 106,
    height: 103,
    borderRadius: 43,
    backgroundColor: "#d5212f",
    borderBottomWidth: 9,
    borderRightWidth: 7,
    borderColor: "#9c1725",
    transform: [{ rotate: "-6deg" }],
  },
  appleLobe: {
    position: "absolute",
    top: -5,
    left: 9,
    width: 80,
    height: 38,
    borderRadius: 30,
    backgroundColor: "#e52f3a",
  },
  appleStem: {
    position: "absolute",
    top: -19,
    left: 51,
    width: 7,
    height: 25,
    backgroundColor: "#6c4327",
    borderRadius: 4,
    transform: [{ rotate: "20deg" }],
  },
  appleLeaf: {
    position: "absolute",
    top: -19,
    left: 60,
    width: 32,
    height: 15,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#4a9835",
    transform: [{ rotate: "-20deg" }],
  },
  appleShine: {
    position: "absolute",
    top: 18,
    left: 16,
    width: 13,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ffadb0",
    opacity: 0.75,
    transform: [{ rotate: "18deg" }],
  },
  ball: {
    position: "absolute",
    left: 106,
    top: 34,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#f58b2b",
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderColor: "#b94a1c",
    overflow: "hidden",
  },
  ballStripe: {
    position: "absolute",
    left: 36,
    top: -8,
    width: 18,
    height: 108,
    borderRadius: 12,
    backgroundColor: "#fff2ce",
    transform: [{ rotate: "28deg" }],
  },
  ballSeam: {
    position: "absolute",
    top: 37,
    left: -7,
    width: 103,
    height: 28,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#b94a1c",
    transform: [{ rotate: "-15deg" }],
  },
  ballShine: {
    position: "absolute",
    top: 12,
    left: 15,
    width: 18,
    height: 27,
    borderRadius: 12,
    backgroundColor: "#ffd8a0",
    opacity: 0.8,
    transform: [{ rotate: "30deg" }],
  },
  ballShadow: {
    position: "absolute",
    left: 102,
    top: 173,
    width: 108,
    height: 12,
    borderRadius: 55,
    backgroundColor: "#554078",
  },
  sprite: { position: "absolute", width: 110, textAlign: "center" },
  slice: {
    position: "absolute",
    top: 45,
    width: 28,
    height: 65,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#fff4cb",
  },
  ground: {
    position: "absolute",
    bottom: 8,
    left: 15,
    right: 15,
    height: 3,
    backgroundColor: "#b3a3d7",
    borderRadius: 15,
  },
  bubble: {
    position: "absolute",
    top: 4,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 6,
    color: "#61449a",
    fontWeight: "800",
  },
  cone: {
    position: "absolute",
    top: 84,
    left: 134,
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderTopWidth: 62,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#d99b56",
  },
  scoop: { position: "absolute", left: 132, width: 52, height: 38, borderRadius: 26 },
  wing: {
    position: "absolute",
    top: 60,
    width: 40,
    height: 20,
    borderRadius: 20,
    backgroundColor: "#4ab872",
    borderWidth: 2,
    borderColor: "#268557",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    borderBottomWidth: 5,
    borderColor: "#837b91",
  },
  handle: {
    position: "absolute",
    top: 68,
    left: 156,
    width: 18,
    height: 58,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#715392",
    borderBottomRightRadius: 14,
  },
  strap: {
    position: "absolute",
    top: 4,
    left: 136,
    height: 145,
    width: 38,
    backgroundColor: "#8874d1",
    borderRadius: 12,
  },
  clock: {
    position: "absolute",
    top: 29,
    left: 108,
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: "#fffdf2",
    borderWidth: 6,
    borderColor: "#5b458f",
  },
  twelve: {
    position: "absolute",
    top: 3,
    alignSelf: "center",
    color: "#5b458f",
    fontWeight: "800",
  },
  handPivot: { position: "absolute", left: 40, top: 7, height: 70, width: 3 },
  minute: { width: 3, height: 34, backgroundColor: "#5b458f", borderRadius: 3 },
  hour: { marginTop: 12, width: 4, height: 22, backgroundColor: "#ef839b", borderRadius: 3 },
  clockDot: {
    position: "absolute",
    top: 37,
    left: 37,
    width: 9,
    height: 9,
    backgroundColor: "#5b458f",
    borderRadius: 5,
  },
  xray: {
    position: "absolute",
    top: 4,
    left: 103,
    width: 105,
    height: 143,
    backgroundColor: "#23334e",
    borderRadius: 14,
    overflow: "hidden",
  },
  palm: { position: "absolute", fontSize: 92, top: 12, left: 0, opacity: 0.55 },
  bones: {
    position: "absolute",
    top: 29,
    left: 15,
    width: 78,
    height: 100,
    backgroundColor: "#23334e",
  },
  fingers: { flexDirection: "row", alignItems: "flex-end", gap: 5 },
  bone: {
    width: 9,
    borderRadius: 6,
    backgroundColor: "#e0faff",
    borderWidth: 1,
    borderColor: "#a9d9f2",
  },
  wrist: {
    width: 12,
    height: 49,
    backgroundColor: "#e0faff",
    alignSelf: "center",
    marginTop: 5,
    borderRadius: 6,
  },
  scan: { position: "absolute", top: 12, width: 105, height: 3, backgroundColor: "#73edf0" },
  string: {
    position: "absolute",
    left: 164,
    top: 0,
    width: 2,
    height: 105,
    backgroundColor: "#8971b6",
  },
});
