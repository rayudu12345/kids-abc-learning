import React, { useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet } from "react-native";
export default function DraggableTile({
  children,
  label,
  disabled,
  selected,
  onSelect,
  onDrop,
  onDrag,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  selected: boolean;
  onSelect: () => void;
  onDrop: (x: number, y: number) => void;
  onDrag: (active: boolean) => void;
}) {
  const offset = useRef(new Animated.ValueXY()).current;
  const [moving, setMoving] = useState(false);
  const latest = useRef({ disabled, onSelect, onDrop, onDrag });
  latest.current = { disabled, onSelect, onDrop, onDrag };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderGrant: () => {
        offset.stopAnimation();
        offset.setValue({ x: 0, y: 0 });
        setMoving(true);
        latest.current.onDrag(true);
      },
      onPanResponderMove: (_, gesture) => offset.setValue({ x: gesture.dx, y: gesture.dy }),
      onPanResponderRelease: (event, gesture) => {
        setMoving(false);
        latest.current.onDrag(false);
        if (Math.abs(gesture.dx) + Math.abs(gesture.dy) < 10) latest.current.onSelect();
        else latest.current.onDrop(event.nativeEvent.pageX, event.nativeEvent.pageY);
        Animated.spring(offset, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
      onPanResponderTerminate: () => {
        offset.setValue({ x: 0, y: 0 });
        setMoving(false);
        latest.current.onDrag(false);
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;
  React.useEffect(() => () => offset.stopAnimation(), [offset]);
  return (
    <Animated.View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      accessibilityActions={[{ name: "activate", label: "Select" }]}
      onAccessibilityAction={() => {
        if (!disabled) onSelect();
      }}
      style={[
        styles.tile,
        selected && styles.selected,
        disabled && { opacity: 0.5 },
        {
          zIndex: moving ? 100 : 1,
          elevation: moving ? 10 : 0,
          transform: offset.getTranslateTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 140,
    padding: 8,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#D3C4E6",
    backgroundColor: "#FFF3CF",
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { borderColor: "#7751C5" },
});
