import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import useAnimalSoundGame from "../hooks/useAnimalSoundGame";
import ActivityToolbar from "../components/ui/ActivityToolbar";
import ActionButton from "../components/ui/ActionButton";
import AnimalChoiceCard from "../components/ui/AnimalChoiceCard";
import FeedbackMessage from "../components/ui/FeedbackMessage";
export default function AnimalSounds({ onExit }: { onExit: () => void }) {
  const game = useAnimalSoundGame();
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ActivityToolbar
        onExit={onExit}
        muted={game.muted}
        onToggleSound={game.toggleSound}
        soundLabel="Animal sound game audio"
      />
      <Text style={styles.title}>🐾 Who makes that sound?</Text>
      {game.finished ? (
        <>
          <Text style={styles.celebration}>⭐ 🐱 🐶 ⭐</Text>
          <FeedbackMessage>Wonderful listening! Four stars saved! 🎉</FeedbackMessage>
          <Text style={styles.note}>Your cat and dog stickers are in your sticker book.</Text>
          <ActionButton onPress={game.restart}>🌈 Play sounds again</ActionButton>
        </>
      ) : (
        <>
          <Text style={styles.round}>
            Sound {game.index + 1} of {game.total}
          </Text>
          <Text style={styles.prompt}>Listen, then tap the animal!</Text>
          <ActionButton
            variant="primary"
            onPress={game.replay}
            disabled={game.muted || game.won}
            accessibilityLabel="Replay animal sound"
          >
            🔊 Hear it again
          </ActionButton>
          {(game.muted || game.hint) && (
            <Text style={styles.clue}>Sound clue: {game.round.target.clue}</Text>
          )}
          <View style={styles.choices}>
            {game.round.choices.map((animal) => (
              <AnimalChoiceCard
                key={animal.letter}
                letter={animal.letter}
                name={animal.name}
                disabled={game.won}
                highlighted={(game.hint || game.won) && animal.letter === game.round.target.letter}
                onPress={() => game.choose(animal.letter)}
              />
            ))}
          </View>
          <FeedbackMessage>
            {game.won
              ? `Yes! ${game.round.target.name}! One saved star! ⭐`
              : game.hint
                ? "Let's try again. The star shows your animal friend!"
                : "Take your time. You can listen again!"}
          </FeedbackMessage>
        </>
      )}
      <Text style={styles.note}>
        Real cat and dog recordings, ready to play offline. No timer or penalties.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F0FBFF" },
  content: { padding: 16, paddingBottom: 35, alignItems: "center" },
  title: {
    color: "#57388E",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 20,
  },
  round: { color: "#9C3868", fontSize: 23, fontWeight: "900", marginVertical: 8 },
  prompt: {
    color: "#267866",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  clue: { color: "#57388E", fontSize: 26, fontWeight: "900", marginVertical: 14 },
  choices: { width: "100%", maxWidth: 750, flexDirection: "row", gap: 12, marginTop: 16 },
  note: {
    color: "#615574",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginVertical: 14,
    maxWidth: 700,
  },
  celebration: { fontSize: 47, marginVertical: 30 },
});
