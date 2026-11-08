import React, { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { advancedAlphabet } from './advancedAlphabet';
import AdvancedScene from './AdvancedScene';
export default function AdvancedLetters({ onExit }: { onExit: () => void }) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const item = advancedAlphabet[index];
  const speak = () => { Speech.stop(); if (!muted) Speech.speak(`${item.letter}. ${item.letter} is for ${item.word}. ${item.meaning}`, { language: 'en-US', rate: 0.75 }); };
  useEffect(() => {
    speak(); return () => { Speech.stop(); };
  }, [index, replay, muted]);
  const select = (next: number) => { Speech.stop(); setIndex(next); setReplay(r => r + 1); };
  return <>
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.toolbar}><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Alphabet</Text></Pressable><Pressable accessibilityRole="switch" accessibilityLabel="Spoken explanations" accessibilityState={{ checked: !muted }} onPress={() => { Speech.stop(); setMuted(m => !m); }} style={s.button}><Text style={s.buttonText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text></Pressable></View>
      <Text style={s.title}>Advanced Letters 🚀</Text>
      <Text style={s.subtitle}>Big discoveries, one word at a time</Text>
      <View style={s.scene}>
        <Text style={s.letter}>{item.letter} <Text style={s.lower}>{item.letter.toLowerCase()}</Text></Text>
        <AdvancedScene key={`${index}-${replay}`} item={item} width={Math.min(width - 44, 900)} height={Math.min(height * 0.34, (width - 44) * 0.7)} />
        <Text style={s.word}>{item.letter} is for {item.word}</Text>
        <Text style={s.meaning}>{item.meaning}</Text>
        <Text style={s.subtitle}>{item.action}</Text>
        <View style={s.controls}><Pressable accessibilityRole="button" onPress={() => setReplay(r => r + 1)} style={s.button}><Text style={s.buttonText}>↻ Hear and play again</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setExpanded(true)} style={s.button}><Text style={s.buttonText}>⛶ Make it BIG!</Text></Pressable></View>
      </View>
      <View style={s.controls}><Pressable accessibilityRole="button" accessibilityState={{ disabled: index === 0 }} disabled={index === 0} onPress={() => select(index - 1)} style={[s.button, index === 0 && s.disabled]}><Text style={s.buttonText}>← Previous</Text></Pressable><Text style={s.subtitle}>{index + 1} / 26</Text><Pressable accessibilityRole="button" accessibilityState={{ disabled: index === 25 }} disabled={index === 25} onPress={() => select(index + 1)} style={[s.button, index === 25 && s.disabled]}><Text style={s.buttonText}>Next →</Text></Pressable></View>
      <Text style={s.subtitle}>Choose any letter to explore</Text>
      <View style={s.grid}>{advancedAlphabet.map((entry, i) => <Pressable key={entry.letter} accessibilityRole="button" accessibilityLabel={`${entry.letter}, ${entry.word}`} accessibilityState={{ selected: i === index }} onPress={() => select(i)} style={[s.card, { width: width >= 600 ? '14%' : '28%' }, i === index && s.selected]}><Text style={s.cardLetter}>{entry.letter}</Text><Text style={s.cardWord}>{entry.word}</Text></Pressable>)}</View>
    </ScrollView>
    <Modal visible={expanded} animationType="fade" onRequestClose={() => setExpanded(false)}><SafeAreaView style={s.fullScreen}><ScrollView contentContainerStyle={{ alignItems: 'center', padding: 12 }}><Pressable accessibilityRole="button" onPress={() => setExpanded(false)} style={s.button}><Text style={s.buttonText}>✕ Back to Advanced Letters</Text></Pressable><Text style={s.word}>{item.letter} is for {item.word}</Text><AdvancedScene item={item} width={width - 24} height={Math.max(150, height - 260)} /><Text style={s.meaning}>{item.meaning}</Text></ScrollView></SafeAreaView></Modal>
  </>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFDF7' }, content: { alignItems: 'center', padding: 12, paddingBottom: 30 }, toolbar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }, button: { padding: 13, minHeight: 48, borderRadius: 18, backgroundColor: '#EEE8FF', marginVertical: 6 }, buttonText: { color: '#58369e', fontSize: 16, fontWeight: '800', textAlign: 'center' }, title: { fontSize: 30, fontWeight: '900', color: '#292348', textAlign: 'center', marginTop: 15 }, subtitle: { fontSize: 15, color: '#6B647E', textAlign: 'center', marginVertical: 10, paddingHorizontal: 4 }, scene: { width: '100%', alignItems: 'center', backgroundColor: '#EEE8FF', borderRadius: 26, padding: 8, marginVertical: 12 }, letter: { fontSize: 58, color: '#59359b', fontWeight: '900' }, lower: { color: '#A28ABB' }, word: { fontSize: 25, fontWeight: '900', color: '#292348', textAlign: 'center', marginVertical: 8 }, meaning: { fontSize: 18, color: '#514361', textAlign: 'center', lineHeight: 27, maxWidth: 760, paddingHorizontal: 10 }, controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10 }, disabled: { opacity: 0.4 }, grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }, card: { minHeight: 95, backgroundColor: '#FFF0C9', borderRadius: 20, borderWidth: 2, borderColor: '#F1DEB2', alignItems: 'center', justifyContent: 'center', padding: 6 }, selected: { borderColor: '#7751C5', backgroundColor: '#E6DAFB' }, cardLetter: { fontSize: 30, fontWeight: '900', color: '#59359b' }, cardWord: { fontSize: 12, fontWeight: '700', color: '#514361', textAlign: 'center' }, fullScreen: { flex: 1, backgroundColor: '#EEE8FF' },
});
