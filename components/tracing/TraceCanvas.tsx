import React from "react";
import { Animated, GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import { Point, TraceItem } from "../../traceCatalog";
type Props = {
  item: TraceItem;
  strokes: Point[][];
  stroke: number;
  visited: number;
  won: boolean;
  guide: Animated.Value;
  size: number;
  backgroundColor: string;
  onStart: (event: GestureResponderEvent) => void;
  onMove: (event: GestureResponderEvent) => void;
  onEnd: () => void;
};
export default function TraceCanvas({
  item,
  strokes,
  stroke,
  visited,
  won,
  guide,
  size,
  backgroundColor,
  onStart,
  onMove,
  onEnd,
}: Props) {
  const scale = size / 300;
  const current = strokes[stroke] ?? strokes[0];
  const guideRange = current.map((_, i) => i / (current.length - 1));
  return (
    <View
      accessibilityLabel={`Tracing canvas for ${item.name}. Follow the purple starting dot.`}
      style={[styles.board, { width: size, height: size, backgroundColor: backgroundColor }]}
      onStartShouldSetResponder={() => !won}
      onMoveShouldSetResponder={() => !won}
      onResponderGrant={onStart}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
      onResponderTerminationRequest={() => false}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {strokes.map((points, si) =>
          points.map((p, pi) => (
            <View
              key={`${si}-${pi}`}
              style={[
                styles.dot,
                {
                  left: p.x * scale - 10 * scale,
                  top: p.y * scale - 10 * scale,
                  width: 20 * scale,
                  height: 20 * scale,
                  borderRadius: 10 * scale,
                  backgroundColor:
                    si < stroke || (si === stroke && pi < visited)
                      ? "#27A783"
                      : si === stroke
                        ? "#FFFFFF"
                        : "#B5A6C5",
                  opacity: si <= stroke ? 1 : 0.65,
                },
              ]}
            />
          )),
        )}
        {item.features?.map((p, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: p.x * scale - 4 * scale,
              top: p.y * scale - 4 * scale,
              width: 8 * scale,
              height: 8 * scale,
              borderRadius: 4 * scale,
              backgroundColor: "#493656",
            }}
          />
        ))}
        {!won && (
          <>
            <View
              style={[
                styles.start,
                {
                  left: current[0].x * scale - 17 * scale,
                  top: current[0].y * scale - 17 * scale,
                  width: 34 * scale,
                  height: 34 * scale,
                  borderRadius: 17 * scale,
                },
              ]}
            />
            <Text
              style={[
                styles.startLabel,
                {
                  left: Math.max(4, Math.min(size - 75, current[0].x * scale - 30)),
                  top: Math.max(4, current[0].y * scale - 45 * scale),
                },
              ]}
            >
              Start {stroke + 1}
            </Text>
            <Animated.View
              style={[
                styles.guide,
                {
                  width: 18 * scale,
                  height: 18 * scale,
                  borderRadius: 9 * scale,
                  transform: [
                    {
                      translateX: guide.interpolate({
                        inputRange: guideRange,
                        outputRange: current.map((p) => p.x * scale - 9 * scale),
                      }),
                    },
                    {
                      translateY: guide.interpolate({
                        inputRange: guideRange,
                        outputRange: current.map((p) => p.y * scale - 9 * scale),
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        )}
        {won && <Text style={styles.success}>⭐</Text>}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  board: {
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#BAA3DE",
    overflow: "hidden",
    marginVertical: 10,
  },
  dot: { position: "absolute" },
  start: {
    position: "absolute",
    borderWidth: 4,
    borderColor: "#7751C5",
    backgroundColor: "#C4ADE7",
  },
  startLabel: { position: "absolute", color: "#684399", fontWeight: "900", fontSize: 15 },
  guide: { position: "absolute", backgroundColor: "#F5B93D", borderWidth: 2, borderColor: "#fff" },
  success: { position: "absolute", bottom: 12, right: 15, fontSize: 45 },
});
