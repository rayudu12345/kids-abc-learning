import React from "react";
import { View } from "react-native";
import { AnimalArt } from "../../AnimalArt";
import { puzzleSlice } from "../../puzzleLogic";
export default function PuzzlePieceArt({
  letter,
  parts,
  piece,
  size,
  faded = false,
}: {
  letter: string;
  parts: 2 | 4;
  piece: number;
  size: number;
  faded?: boolean;
}) {
  const slice = puzzleSlice(parts, piece, size);
  return (
    <View
      pointerEvents="none"
      style={{
        width: slice.width,
        height: slice.height,
        overflow: "hidden",
        opacity: faded ? 0.2 : 1,
      }}
    >
      <View
        style={{ position: "absolute", left: -slice.x, top: -slice.y, width: size, height: size }}
      >
        <AnimalArt letter={letter} size={size} />
      </View>
    </View>
  );
}
