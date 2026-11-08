import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { AnimalArt, AnimatedAnimal } from './AnimalArt';
import { choicesFor, newLesson } from './quizLogic';
import { useProgress } from './ProgressStore';

export default function LetterPairs({ onExit }: { onExit: () => void }) {
  const { width } = useWindowDimensions();
  const { recordAnswer, saveError } = useProgress();
  const [lesson, setLesson] = useState(newLesson);
  const [round, setRound] = useState(0);
  const target = lesson[round];
  const [choices, setChoices] = useState(() => choicesFor(target));
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const locked = useRef(false);
  const say = (text: string) => { Speech.stop(); if (!muted) Speech.speak(text, { language: 'en-US', rate: 0.76 }); };
  const prompt = `This is uppercase ${target.letter}. Can you find lowercase ${target.letter}? ${target.letter} is for ${target.word}.`;
  useEffect(() => {
    if (!muted && !finished) Speech.speak(prompt, { language: 'en-US', rate: 0.76 });
    return () => { Speech.stop(); };
  }, [prompt, muted, finished]);
  useEffect(() => {
    if (!won || finished) return;
    const timer = setTimeout(() => {
      Speech.stop();
      if (round === lesson.length - 1) { setFinished(true); return; }
      setChoices(choicesFor(lesson[round + 1])); setRound(round + 1);
      setWon(false); setHint(false); locked.current = false;
    }, 3000);
    return () => clearTimeout(timer);
  }, [won, finished, round, lesson]);
  const choose = (letter: string) => {
    if (locked.current) return;
    if (letter !== target.letter) { setHint(true); say(`Let's try together. Find lowercase ${target.letter}, in the purple border.`); return; }
    locked.current = true; setWon(true);
    recordAnswer(target.letter, 'letters', round === lesson.length - 1);
    say(`Hooray! Uppercase ${target.letter} and lowercase ${target.letter}!`);
  };
  const restart = () => {
    Speech.stop(); const fresh = newLesson(); setLesson(fresh); setRound(0); setChoices(choicesFor(fresh[0]));
    setWon(false); setHint(false); setFinished(false); locked.current = false;
  };
  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <View style={s.toolbar}><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Alphabet</Text></Pressable><Pressable accessibilityRole="switch" accessibilityLabel="Spoken prompts" accessibilityState={{ checked: !muted }} onPress={() => { Speech.stop(); setMuted(m => !m); }} style={s.button}><Text style={s.buttonText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text></Pressable></View>
    <Text style={s.title}>{finished ? 'Lovely letter pairs! 🎉' : 'Big and little letters'}</Text>
    <Text style={s.subtitle}>{finished ? 'You matched five uppercase and lowercase letters.' : `Letter pair ${round + 1} of 5`}</Text>
    <Text style={s.stars} accessibilityLabel={`${round + (won ? 1 : 0)} stars earned`}>{Array.from({ length: 5 }, (_, i) => i < round + (won ? 1 : 0) ? '⭐' : '☆').join(' ')}</Text>
    {finished ? <>
      <View style={s.collection}>{lesson.map(a => <View key={a.letter} style={s.sticker}><AnimalArt letter={a.letter} size={85} /><Text style={s.pair}>{a.letter} {a.letter.toLowerCase()}</Text><Text style={s.subtitle}>{a.word}</Text></View>)}</View>
      <Pressable accessibilityRole="button" onPress={restart} style={s.primary}><Text style={s.primaryText}>Play another adventure</Text></Pressable><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>Back to exploring</Text></Pressable>
    </> : <>
      <Text style={s.subtitle}>Find the little letter that matches</Text>
      <View style={s.hero}><Text accessibilityLabel={`Uppercase ${target.letter}`} style={s.upper}>{target.letter}</Text>{won && <Text accessibilityLabel={`Lowercase ${target.letter}`} style={s.upper}>{target.letter.toLowerCase()}</Text>}<AnimatedAnimal letter={target.letter} size={width >= 600 ? 150 : 105} /></View>
      <Text style={s.subtitle}>{target.letter} is for {target.word}</Text>
      <Pressable accessibilityRole="button" onPress={() => say(prompt)} style={s.button}><Text style={s.buttonText}>🔊 Hear it again</Text></Pressable>
      <View style={s.choices}>{choices.map(a => <Pressable key={a.letter} accessibilityRole="button" accessibilityLabel={`Lowercase ${a.letter}`} accessibilityState={{ disabled: won }} disabled={won} onPress={() => choose(a.letter)} style={({ pressed }) => [s.choice, (hint || won) && a.letter === target.letter && s.highlight, pressed && { opacity: 0.7 }]}><Text style={s.lower}>{a.letter.toLowerCase()}</Text></Pressable>)}</View>
      <Text accessibilityLiveRegion="polite" style={s.message}>{won ? `Wonderful! ${target.letter} and ${target.letter.toLowerCase()} belong together! ⭐` : hint ? `Try ${target.letter.toLowerCase()} in the purple border. Take your time!` : 'Tap a little letter. There is no hurry. ♡'}</Text>
      {won && <Text style={s.subtitle}>{round === 4 ? 'Your letter pairs are coming…' : 'The next pair is coming…'}</Text>}
    </>}
    <Text style={s.note}>{saveError ? 'Rewards could not be saved yet. Try saving from My sticker book.' : 'Your stars and animal stickers are saved in My sticker book.'}</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFDF7' }, content: { padding: 16, alignItems: 'center', paddingBottom: 35 }, toolbar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: { padding: 13, minHeight: 48, borderRadius: 18, backgroundColor: '#EEE8FF', marginVertical: 6 }, buttonText: { fontSize: 16, fontWeight: '800', color: '#58369e' }, title: { color: '#292348', fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 18 }, subtitle: { color: '#6B647E', fontSize: 16, textAlign: 'center', marginVertical: 8 },
  stars: { fontSize: 30, color: '#ab7a17', marginVertical: 12 }, hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 12, flexWrap: 'wrap' }, upper: { fontSize: 85, fontWeight: '900', color: '#59359b' },
  choices: { flexDirection: 'row', gap: 12, width: '100%', maxWidth: 650, marginTop: 14 }, choice: { flex: 1, minHeight: 130, backgroundColor: '#DFF4FF', borderRadius: 24, borderWidth: 4, borderColor: '#c2e2ef', alignItems: 'center', justifyContent: 'center' }, highlight: { borderColor: '#7751C5', backgroundColor: '#F0E5FF' }, lower: { fontSize: 76, fontWeight: '800', color: '#292348' },
  message: { color: '#5E4980', fontWeight: '800', fontSize: 19, textAlign: 'center', marginVertical: 18 }, note: { color: '#6B647E', fontSize: 12, textAlign: 'center', marginTop: 15 }, collection: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }, sticker: { backgroundColor: '#FFF0C9', padding: 16, borderRadius: 22, alignItems: 'center' }, pair: { fontSize: 35, fontWeight: '800', color: '#59359b' }, primary: { padding: 18, backgroundColor: '#6946BC', borderRadius: 24, marginVertical: 15 }, primaryText: { fontSize: 20, color: 'white', fontWeight: '800', textAlign: 'center' },
});
