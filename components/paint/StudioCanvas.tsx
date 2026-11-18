import React, { forwardRef } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { StudioDocument, StudioMark } from "../../studioLogic";
import StudioMarkArt from "./StudioMarkArt";
type Props = {
  doc: StudioDocument;
  draft: StudioMark | null;
  size: number;
  enabled: boolean;
  onStart: (x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
};
const StudioCanvas = forwardRef<Svg, Props>(function StudioCanvas(
  { doc, draft, size, enabled, onStart, onMove, onEnd },
  ref,
) {
  const coordinate = (event: GestureResponderEvent, handler: typeof onStart) =>
    handler((event.nativeEvent.locationX * 300) / size, (event.nativeEvent.locationY * 300) / size);
  return (
    <View
      accessibilityLabel="Paint Studio canvas. Draw with your finger."
      style={[styles.board, { width: size, height: size }]}
      onStartShouldSetResponder={() => enabled}
      onMoveShouldSetResponder={() => enabled}
      onResponderGrant={(event) => coordinate(event, onStart)}
      onResponderMove={(event) => coordinate(event, onMove)}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
      onResponderTerminationRequest={() => false}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg ref={ref} accessible={false} width="100%" height="100%" viewBox="0 0 300 300">
          <Rect width={300} height={300} fill={doc.background} />
          {doc.marks.map((mark, index) => (
            <StudioMarkArt key={index} mark={mark} background={doc.background} />
          ))}
          {draft && <StudioMarkArt mark={draft} background={doc.background} />}
        </Svg>
      </View>
    </View>
  );
});
export default StudioCanvas;
const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: "#B6A3D2",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
});
