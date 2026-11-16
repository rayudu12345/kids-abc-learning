import React, { useMemo } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { TraceItem, sampledStrokes } from "../../traceCatalog";
import { PaintStroke } from "../../coloringLogic";
export default function PaintCanvas({
  item,
  marks,
  draft,
  size,
  onStart,
  onMove,
  onEnd,
}: {
  item: TraceItem;
  marks: PaintStroke[];
  draft: PaintStroke | null;
  size: number;
  onStart: (x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
}) {
  const scale = size / 300,
    paths = useMemo(() => sampledStrokes(item), [item]);
  const coordinate = (event: GestureResponderEvent, callback: typeof onStart) =>
    callback(event.nativeEvent.locationX / scale, event.nativeEvent.locationY / scale);
  return (
    <View
      accessibilityLabel={`Coloring canvas for ${item.name}. Paint with your finger.`}
      style={[styles.board, { width: size, height: size }]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) => coordinate(event, onStart)}
      onResponderMove={(event) => coordinate(event, onMove)}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
      onResponderTerminationRequest={() => false}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[...marks, ...(draft ? [draft] : [])].map((stroke, si) =>
          stroke.points.map((point, pi) => (
            <View
              testID="paint-dot"
              key={`${si}-${pi}`}
              style={{
                position: "absolute",
                left: (point.x - stroke.size / 2) * scale,
                top: (point.y - stroke.size / 2) * scale,
                width: stroke.size * scale,
                height: stroke.size * scale,
                borderRadius: (stroke.size * scale) / 2,
                backgroundColor: stroke.color,
              }}
            />
          )),
        )}
        {paths.map((path, index) =>
          path.slice(1).map((b, i) => {
            const a = path[i],
              length = Math.hypot(b.x - a.x, b.y - a.y) * scale;
            return (
              <View
                key={`line-${index}-${i}`}
                style={{
                  position: "absolute",
                  left: ((a.x + b.x) / 2) * scale - length / 2,
                  top: ((a.y + b.y) / 2) * scale - 1.5 * scale,
                  width: length + 1,
                  height: 3 * scale,
                  borderRadius: 2 * scale,
                  backgroundColor: "#493656",
                  transform: [
                    { rotate: `${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI}deg` },
                  ],
                }}
              />
            );
          }),
        )}
        {item.features?.map((point, index) => (
          <View
            key={`feature-${index}`}
            style={{
              position: "absolute",
              left: (point.x - 3) * scale,
              top: (point.y - 3) * scale,
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: 3 * scale,
              backgroundColor: "#493656",
            }}
          />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  board: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#B6A3D2",
  },
});
