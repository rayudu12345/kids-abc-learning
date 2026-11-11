import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import { alphabet } from "../LetterScene";
import * as Audio from "../audio/speech";
import { recordings } from "../audio/recordings";
const credits = require("../assets/audio/attribution.json") as {
  id: string;
  artist: string;
  license: string;
  source: string;
  licenseUrl: string;
  changes: string;
}[];
export default function AudioLibrary({ onExit }: { onExit: () => void }) {
  const [muted, setMuted] = useState(false),
    [showCredits, setShowCredits] = useState(false);
  const [last, setLast] = useState({ id: "letter-A", text: "A" });
  useEffect(
    () => () => {
      void Audio.stop();
    },
    [],
  );
  const play = (id: string, text: string) => {
    setLast({ id, text });
    if (!muted) Audio.playRecording(id, text);
  };
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.page}>
      <ActivityToolbar
        onExit={onExit}
        muted={muted}
        onToggleSound={() => {
          void Audio.stop();
          setMuted((value) => !value);
        }}
      />
      <Text style={styles.title}>🔊 Listen and explore</Text>
      <Text style={styles.note}>
        Human recordings are stored in the app and play offline. A “Device voice” label means that
        clip needs your tablet's offline English voice.
      </Text>
      <ActionButton onPress={() => play(last.id, last.text)}>↻ Replay last sound</ActionButton>
      <Text style={styles.section}>Animal sounds</Text>
      <View style={styles.row}>
        {[
          { id: "sound-cat", title: "Cat meow 🐱" },
          { id: "sound-dog", title: "Dog bark 🐶" },
          { id: "sound-birds", title: "Garden birds 🐦" },
        ].map((sound) => (
          <ActionButton
            key={sound.id}
            onPress={() => {
              if (Audio.hasRecording(sound.id)) play(sound.id, sound.title);
            }}
            disabled={!Audio.hasRecording(sound.id)}
          >
            {sound.title}
          </ActionButton>
        ))}
      </View>
      <Text style={styles.section}>Letters and words</Text>
      <View style={styles.grid}>
        {alphabet.map(([letter, word]) => (
          <View key={letter} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hear letter ${letter}`}
              onPress={() => play(`letter-${letter}`, letter)}
            >
              <Text style={styles.letter}>{letter}</Text>
              <Text style={styles.badge}>
                {Audio.hasRecording(`letter-${letter}`) ? "Recording" : "Device voice"}
              </Text>
            </Pressable>
            <ActionButton onPress={() => play(word.toLowerCase().replace(/ /g, "-"), word)}>
              {word}
            </ActionButton>
            <Text style={styles.badge}>
              {Audio.hasRecording(word.toLowerCase().replace(/ /g, "-"))
                ? "Recorded word"
                : "Word: device voice"}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        {Object.keys(recordings).length} bundled clips. Longer guidance and unrecorded words use
        device speech. Recorded word examples are not isolated phoneme recordings.
      </Text>
      <ActionButton onPress={() => setShowCredits((value) => !value)}>
        {showCredits ? "Hide recording credits" : "Show recording credits"}
      </ActionButton>
      {showCredits &&
        credits.map((credit) => (
          <Text key={credit.id} selectable style={styles.credit}>
            {credit.id}: {credit.artist} · {credit.license}
            {"\n"}
            {credit.source}
            {"\n"}
            {credit.licenseUrl}
            {"\n"}
            {credit.changes}
          </Text>
        ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { alignItems: "center", padding: 16, paddingBottom: 35 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#57388E",
    textAlign: "center",
    marginVertical: 18,
  },
  note: {
    color: "#615574",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 760,
    marginVertical: 12,
  },
  section: { fontSize: 22, fontWeight: "800", color: "#267866", marginVertical: 14 },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  card: {
    width: "43%",
    maxWidth: 230,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#FFE9AD",
    alignItems: "center",
  },
  letter: { fontSize: 48, fontWeight: "900", color: "#6946BC", textAlign: "center" },
  badge: { color: "#615574", fontSize: 12, textAlign: "center" },
  credit: { color: "#615574", fontSize: 12, marginVertical: 8, width: "100%" },
});
