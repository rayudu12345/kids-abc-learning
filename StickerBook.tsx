import { AnimalArt } from "./AnimalArt";
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { animals } from './quizLogic';
import { useProgress } from './ProgressStore';
export default function StickerBook({ onExit }: { onExit: () => void }) {
  const { progress, saveError, retrySave } = useProgress();
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Back to exploring</Text></Pressable>
    <Text style={s.title}>My animal sticker book 🐾</Text>
    <Text style={s.stars}>⭐ {progress.stars} stars earned</Text>
    <Text style={s.subtitle}>{progress.stickers.length} of {animals.length} animal stickers collected</Text>
    <View style={s.grid}>{animals.map(animal => {
      const earned = progress.stickers.includes(animal.letter);
      return <View key={animal.letter} accessible accessibilityLabel={earned ? `${animal.word} sticker collected` : `${animal.word} sticker waiting to be collected`} style={[s.sticker, !earned && s.locked]}>{earned ? <AnimalArt letter={animal.letter} size={90} /> : <Text style={s.emoji}>🐾</Text>}<Text style={s.label}>{animal.letter} · {animal.word}</Text><Text style={s.hint}>{earned ? 'Collected! ⭐' : 'Find me in a game'}</Text></View>;
    })}</View>
    <Text style={s.subtitle}>Completed letter adventures: {progress.completed.letters}</Text>
    <Text style={s.subtitle}>Completed matching adventures: {progress.completed.matching}</Text>
    {saveError ? <View><Text accessibilityLiveRegion="polite" style={s.error}>Your latest rewards could not be saved. You can keep playing and try saving again.</Text><Pressable accessibilityRole="button" onPress={retrySave} style={s.button}><Text style={s.buttonText}>Try saving again</Text></Pressable></View> : <Text style={s.hint}>Saved on this tablet. Your stickers will be here next time!</Text>}
    <Text style={s.note}>Play either animal game to earn stickers. Repeated matches earn more stars. Removing the app or clearing its data removes saved rewards.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFDF7' }, content: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  button: { padding: 16, backgroundColor: '#EEE8FF', borderRadius: 20, marginVertical: 10, alignSelf: 'center' }, buttonText: { color: '#58369e', fontSize: 18, fontWeight: '800' },
  title: { color: '#292348', fontSize: 28, fontWeight: '900', textAlign: 'center', marginVertical: 20 }, stars: { color: '#987019', fontSize: 28, fontWeight: '800' }, subtitle: { color: '#6B647E', fontSize: 17, textAlign: 'center', marginVertical: 10 },
  grid: { width: '100%', maxWidth: 800, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginVertical: 20 }, sticker: { width: '44%', maxWidth: 180, minHeight: 160, backgroundColor: '#FFF0C9', borderRadius: 24, padding: 12, alignItems: 'center', justifyContent: 'center' }, locked: { backgroundColor: '#EEEAF3' },
  emoji: { fontSize: 68 }, label: { fontSize: 17, fontWeight: '800', color: '#39334D', textAlign: 'center' }, hint: { color: '#6B647E', fontSize: 14, textAlign: 'center', marginVertical: 8 }, error: { color: '#7f4336', fontSize: 16, textAlign: 'center' }, note: { color: '#6B647E', fontSize: 12, textAlign: 'center', maxWidth: 600, marginTop: 20 },
});
