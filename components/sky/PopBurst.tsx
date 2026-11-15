import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { skyColors } from "../../skyPlayLogic";
export default function PopBurst({ kite }: { kite: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);
  return (
    <View pointerEvents="none" style={styles.burst}>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index * Math.PI * 2) / 10;
        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor: skyColors[index % skyColors.length],
                opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(angle) * 58],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(angle) * 58],
                    }),
                  },
                  { rotate: `${index * 36}deg` },
                ],
              },
            ]}
          />
        );
      })}
      <Text style={styles.word}>{kite ? "Whee! ✨" : "POP! ⭐"}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  burst: { width: 90, height: 170, alignItems: "center", justifyContent: "center" },
  particle: { position: "absolute", left: 40, top: 56, width: 10, height: 17, borderRadius: 4 },
  word: {
    position: "absolute",
    top: 40,
    fontSize: 24,
    fontWeight: "900",
    color: "#6E3AA1",
    textAlign: "center",
    width: 110,
    left: -10,
    backgroundColor: "#FFF9DF",
    borderRadius: 15,
    paddingVertical: 5,
  },
});
