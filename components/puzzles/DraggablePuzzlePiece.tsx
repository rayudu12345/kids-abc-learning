import type { PuzzleParts } from "../../puzzleLogic";
import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text } from "react-native";
import useReducedMotion from "../../hooks/useReducedMotion";
import { puzzlePartName, puzzleGrid } from "../../puzzleLogic";
import PuzzlePieceArt from "./PuzzlePieceArt";
export default function DraggablePuzzlePiece({
  piece,
  parts,
  letter,
  name,
  selected,
  disabled,
  onSelect,
  onDrop,
  onDrag,
}: {
  piece: number;
  parts: PuzzleParts;
  letter: string;
  name: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: number) => void;
  onDrop: (id: number, x: number, y: number) => void;
  onDrag: (active: boolean) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current,
    reduced = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ piece, disabled, onSelect, onDrop, onDrag, reduced });
  latest.current = { piece, disabled, onSelect, onDrop, onDrag, reduced };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => !latest.current.disabled,
      onMoveShouldSetPanResponderCapture: () => !latest.current.disabled,
      onPanResponderGrant: () => {
        position.stopAnimation();
        position.setValue({ x: 0, y: 0 });
        setDragging(true);
        latest.current.onDrag(true);
        latest.current.onSelect(latest.current.piece);
      },
      onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: gesture.dy }),
      onPanResponderRelease: (event, gesture) => {
        setDragging(false);
        latest.current.onDrag(false);
        if (Math.abs(gesture.dx) + Math.abs(gesture.dy) < 10)
          latest.current.onSelect(latest.current.piece);
        else
          latest.current.onDrop(
            latest.current.piece,
            event.nativeEvent.pageX,
            event.nativeEvent.pageY,
          );
        if (latest.current.reduced) position.setValue({ x: 0, y: 0 });
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        position.setValue({ x: 0, y: 0 });
        setDragging(false);
        latest.current.onDrag(false);
      },
    }),
  ).current;
  useEffect(() => () => position.stopAnimation(), [position]);
  return (
    <Animated.View
      {...responder.panHandlers}
      style={{ zIndex: dragging ? 100 : 1, transform: position.getTranslateTransform() }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${name} piece ${piece + 1}`}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={() => onSelect(piece)}
        style={[styles.card, selected && styles.selected]}
      >
        {disabled ? (
          <Text style={styles.star}>⭐</Text>
        ) : (
          <PuzzlePieceArt
            letter={letter}
            parts={parts}
            piece={piece}
            size={Math.max(160, puzzleGrid(parts).columns * 70)}
          />
        )}
        <Text style={styles.label}>
          {puzzlePartName(parts, piece)}
          {disabled ? " ✓" : ""}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: {
    minWidth: 95,
    minHeight: 110,
    padding: 7,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE6AD",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  selected: { borderColor: "#6946BC", backgroundColor: "#E7D9FF" },
  label: { fontSize: 15, color: "#493656", fontWeight: "800", textAlign: "center", maxWidth: 95 },
  star: { fontSize: 40 },
});
