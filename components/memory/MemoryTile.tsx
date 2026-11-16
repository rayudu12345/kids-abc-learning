import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import MemoryPhoto from "./MemoryPhoto";
import { PhotoStatus } from "../../hooks/useMemoryPhotos";
import { MemoryCard } from "../../memoryLogic";
export default function MemoryTile({
  card,
  visible,
  matched,
  disabled,
  columns,
  onPress,
  photoStatus,
  attempt,
  onPhotoError,
}: {
  card: MemoryCard;
  visible: boolean;
  matched: boolean;
  disabled: boolean;
  columns: number;
  onPress: () => void;
  photoStatus: PhotoStatus;
  attempt: number;
  onPhotoError: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        visible
          ? `${matched ? "Matched" : "Open"} ${card.animal.word} card ${card.id + 1}`
          : `Hidden card ${card.id + 1}`
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.card,
        {
          width: columns === 2 ? "46%" : "30%",
          backgroundColor: matched ? "#C6F1DF" : visible ? "#FFF0C9" : "#D8C7FF",
        },
      ]}
    >
      {visible ? (
        <>
          <MemoryPhoto
            animal={card.animal}
            status={photoStatus}
            attempt={attempt}
            onError={onPhotoError}
          />
          <Text style={styles.name}>
            {card.animal.word}
            {matched ? " ✓" : ""}
          </Text>
        </>
      ) : (
        <Text style={styles.back}>🐾</Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    minHeight: 138,
    borderRadius: 22,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: { color: "#57388E", fontSize: 19, fontWeight: "900" },
  back: { fontSize: 48 },
});
