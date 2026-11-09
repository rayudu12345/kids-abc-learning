import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text } from "react-native";
import { Animal } from "../../quizLogic";
import { AnimalArt } from "../../AnimalArt";
export default function DraggableAnimal({
  animal,
  disabled,
  selected,
  onDrop,
  onSelect,
  onDrag,
}: {
  animal: Animal;
  disabled: boolean;
  selected: boolean;
  onDrop: (animal: Animal, x: number, y: number) => void;
  onSelect: (animal: Animal) => void;
  onDrag: (active: boolean) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ animal, disabled, onDrop, onSelect, onDrag });
  latest.current = { animal, disabled, onDrop, onSelect, onDrag };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderGrant: () => {
        position.stopAnimation();
        position.setValue({ x: 0, y: 0 });
        setDragging(true);
        latest.current.onDrag(true);
      },
      onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (event, g) => {
        setDragging(false);
        latest.current.onDrag(false);
        if (Math.abs(g.dx) + Math.abs(g.dy) < 10) latest.current.onSelect(latest.current.animal);
        else
          latest.current.onDrop(
            latest.current.animal,
            event.nativeEvent.pageX,
            event.nativeEvent.pageY,
          );
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        position.setValue({ x: 0, y: 0 });
        setDragging(false);
        latest.current.onDrag(false);
      },
    }),
  ).current;
  useEffect(
    () => () => {
      position.stopAnimation();
    },
    [position],
  );
  return (
    <Animated.View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${animal.word}. Select, then tap its matching picture.`}
      accessibilityState={{ disabled, selected }}
      accessibilityActions={[{ name: "activate", label: "Select animal" }]}
      onAccessibilityAction={() => {
        if (!disabled) onSelect(animal);
      }}
      style={[
        styles.tile,
        styles.source,
        selected && styles.selected,
        disabled && styles.done,
        {
          zIndex: dragging ? 100 : 1,
          elevation: dragging ? 12 : 0,
          transform: position.getTranslateTransform(),
        },
      ]}
    >
      {disabled ? (
        <Text style={styles.animal}>⭐</Text>
      ) : (
        <AnimalArt letter={animal.letter} size={70} />
      )}
      <Text style={styles.name}>{animal.word}</Text>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  tile: {
    minHeight: 125,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  source: { flex: 1, borderColor: "#C2E2EF", backgroundColor: "#DFF4FF" },
  selected: { borderColor: "#7046B9", borderWidth: 4 },
  done: { opacity: 0.5 },
  animal: { fontSize: 56 },
  name: { fontSize: 14, fontWeight: "800", color: "#39334D", textAlign: "center" },
});
