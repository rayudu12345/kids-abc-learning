import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MemoryAnimal } from "../../data/memoryAnimals";
import ActionButton from "../ui/ActionButton";
export default function PhotoCredits({ animals }: { animals: MemoryAnimal[] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.panel}>
      <ActionButton
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
      >
        {open ? "Hide photo credits" : "Photo credits"}
      </ActionButton>
      {open && (
        <>
          <Text style={styles.credit}>
            Photos from Wikimedia Commons, resized for these cards. Original licenses apply.
          </Text>
          {animals.map((animal) => (
            <Text key={animal.id} selectable style={styles.credit}>
              {animal.word}: {animal.photo.creator}
              {"\n"}
              {animal.photo.license}
              {"\n"}
              {animal.photo.sourceUrl}
              {"\n"}
              {animal.photo.licenseUrl}
            </Text>
          ))}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  panel: { width: "100%", maxWidth: 700, marginVertical: 10 },
  credit: { color: "#615574", fontSize: 13, lineHeight: 20, marginVertical: 8 },
});
