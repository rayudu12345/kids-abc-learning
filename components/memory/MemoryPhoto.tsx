import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { MemoryAnimal, memoryPhotoUri } from "../../data/memoryAnimals";
import { PhotoStatus } from "../../hooks/useMemoryPhotos";
export default function MemoryPhoto({
  animal,
  status,
  attempt,
  onError,
}: {
  animal: MemoryAnimal;
  status: PhotoStatus;
  attempt: number;
  onError: () => void;
}) {
  return (
    <View style={styles.frame} pointerEvents="none">
      {status === "ready" ? (
        <Image
          testID="online-memory-photo"
          accessible={false}
          source={{ uri: memoryPhotoUri(animal, attempt) }}
          resizeMode="contain"
          style={styles.photo}
          onError={onError}
        />
      ) : status === "failed" ? (
        <>
          <Text style={styles.emoji}>{animal.emoji}</Text>
          <Text style={styles.note}>Photo unavailable</Text>
        </>
      ) : (
        <ActivityIndicator accessibilityLabel="Loading animal photo" size="large" color="#6946BC" />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  frame: { width: "100%", height: 118, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: "100%", borderRadius: 12 },
  emoji: { fontSize: 54 },
  note: { color: "#615574", fontSize: 12, textAlign: "center" },
});
