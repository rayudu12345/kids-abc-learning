import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Screen } from "../../SideMenu";
import LetterScene from "../../LetterScene";
import useAlphabetPlayback from "../../hooks/useAlphabetPlayback";
import SceneModal from "../ui/SceneModal";
import ActivityShortcuts from "./ActivityShortcuts";
import AlphabetGrid from "./AlphabetGrid";
import AlphabetHero from "./AlphabetHero";
export default function AlphabetHome({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const { width, height } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const playback = useAlphabetPlayback();
  const sceneWidth = Math.max(180, width - 40);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>LET'S LEARN TOGETHER</Text>
          <Text style={styles.title}>Kids ABC Learning 🌈</Text>
          <Text style={styles.subtitle}>Tap a letter to start its mini animation!</Text>
        </View>
        <ActivityShortcuts onNavigate={onNavigate} />
        <AlphabetHero
          item={playback.activeItem}
          version={playback.sceneVersion}
          scale={playback.heroScale}
          width={sceneWidth}
          height={Math.min(height * 0.38, sceneWidth * 0.67)}
          onExpand={() => setExpanded(true)}
        />
        <Text style={styles.section}>Choose a letter A–Z</Text>
        <AlphabetGrid
          tablet={width >= 600}
          activeLetter={playback.activeLetter}
          bounce={playback.cardBounce}
          onSelect={playback.playLetter}
        />
      </ScrollView>
      <SceneModal
        visible={expanded && !!playback.activeItem}
        onClose={() => setExpanded(false)}
        title={
          playback.activeItem ? `${playback.activeItem[0]} is for ${playback.activeItem[1]}!` : ""
        }
        description={playback.activeItem?.[3]}
      >
        {playback.activeItem && (
          <LetterScene
            key={`big-${playback.activeLetter}-${playback.sceneVersion}`}
            letter={playback.activeItem[0]}
            width={width - 24}
            height={Math.max(160, height - 230)}
          />
        )}
      </SceneModal>
      <Text style={styles.footer}>Little letters, big discoveries! ⭐</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { paddingTop: 12, paddingHorizontal: 18, paddingBottom: 10, alignItems: "center" },
  eyebrow: { color: "#7C63C9", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#292348", fontSize: 25, fontWeight: "900", textAlign: "center", marginTop: 5 },
  subtitle: { color: "#68647A", fontSize: 13, marginTop: 4, textAlign: "center" },
  section: {
    color: "#39334D",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 3,
  },
  footer: {
    textAlign: "center",
    paddingVertical: 7,
    color: "#7C63C9",
    fontSize: 11,
    fontWeight: "700",
  },
});
