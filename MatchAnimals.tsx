import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { useProgress } from './ProgressStore';
import { Animal, animals, shuffle } from './quizLogic';

import { DropBox, findDropTarget } from './matchLogic';
function Draggable({ animal, disabled, selected, onDrop, onSelect, onDrag }: {
  animal: Animal; disabled: boolean; selected: boolean;
  onDrop: (animal: Animal, x: number, y: number) => void;
  onSelect: (animal: Animal) => void; onDrag: (active: boolean) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ animal, disabled, onDrop, onSelect, onDrag });
  latest.current = { animal, disabled, onDrop, onSelect, onDrag };
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => !latest.current.disabled,
    onMoveShouldSetPanResponder: () => !latest.current.disabled,
    onPanResponderGrant: () => { position.stopAnimation(); position.setValue({ x: 0, y: 0 }); setDragging(true); latest.current.onDrag(true); },
    onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (event, g) => {
      setDragging(false); latest.current.onDrag(false);
      if (Math.abs(g.dx) + Math.abs(g.dy) < 10) latest.current.onSelect(latest.current.animal);
      else latest.current.onDrop(latest.current.animal, event.nativeEvent.pageX, event.nativeEvent.pageY);
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => { position.setValue({ x: 0, y: 0 }); setDragging(false); latest.current.onDrag(false); },
  })).current;
  useEffect(() => () => { position.stopAnimation(); }, [position]);
  return <Animated.View {...responder.panHandlers} accessible accessibilityRole="button" accessibilityLabel={`${animal.word}. Select, then tap its matching picture.`} accessibilityState={{ disabled, selected }} accessibilityActions={[{ name: 'activate', label: 'Select animal' }]} onAccessibilityAction={() => { if (!disabled) onSelect(animal); }} style={[s.tile, s.source, selected && s.selected, disabled && s.done, { zIndex: dragging ? 100 : 1, elevation: dragging ? 12 : 0, transform: position.getTranslateTransform() }]}>
    <Text style={s.animal}>{disabled ? '⭐' : animal.emoji}</Text><Text style={s.name}>{animal.word}</Text>
  </Animated.View>;
}
function newRounds() { return Array.from({ length: 3 }, () => shuffle(animals).slice(0, 3)); }
export default function MatchAnimals({ onExit }: { onExit: () => void }) {
  const { recordAnswer, saveError } = useProgress();
  const { width } = useWindowDimensions();
  const [rounds, setRounds] = useState(newRounds);
  const [round, setRound] = useState(0);
  const [targets, setTargets] = useState(() => shuffle(rounds[0]));
  const [matched, setMatched] = useState<string[]>([]);
  const matchedRef = useRef<string[]>([]);
  const [selected, setSelected] = useState<Animal | null>(null);
  const [dragging, setDragging] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState('Drag each animal to its matching picture below.');
  const targetRefs = useRef<Record<string, React.ComponentRef<typeof View> | null>>({});
  const boxes = useRef<Record<string, DropBox>>({});
  const measureTargets = () => {
    Object.entries(targetRefs.current).forEach(([letter, view]) => view?.measureInWindow((x, y, width, height) => {
      boxes.current[letter] = { x, y, width, height };
    }));
  };
  const say = (text: string) => { Speech.stop(); if (!muted) Speech.speak(text, { language: 'en-US', rate: 0.8 }); };
  useEffect(() => {
    if (!muted && !finished) Speech.speak('Match the animals! Drag each animal to the same picture.', { language: 'en-US', rate: 0.8 });
    return () => { Speech.stop(); };
  }, [round, muted, finished]);
  const complete = matched.length === 3;
  useEffect(() => {
    if (!complete || finished) return;
    const timer = setTimeout(() => {
      if (round === rounds.length - 1) { setFinished(true); return; }
      boxes.current = {}; matchedRef.current = [];
      setTargets(shuffle(rounds[round + 1])); setRound(round + 1); setMatched([]); setSelected(null);
      setMessage('Here are three more animal friends!');
    }, 2500);
    return () => clearTimeout(timer);
  }, [complete, finished, round, rounds]);
  const match = (animal: Animal, targetLetter?: string) => {
    if (matchedRef.current.includes(animal.letter) || complete) return;
    if (animal.letter !== targetLetter) {
      setSelected(animal); setMessage(`Try the matching ${animal.word.toLowerCase()} picture. You can do it!`);
      say(`Find the other ${animal.word}.`); return;
    }
    matchedRef.current = [...matchedRef.current, animal.letter];
    recordAnswer(animal.letter, "matching", matchedRef.current.length === 3 && round === rounds.length - 1);
    setMatched([...matchedRef.current]); setSelected(null);
    setMessage(matchedRef.current.length === 3 ? 'All three matched! Next adventure is coming…' : `Yes! Two ${animal.word.toLowerCase()} friends! ⭐`);
    say(`Hooray! ${animal.word}!`);
  };
  const drop = (animal: Animal, x: number, y: number) => {
    match(animal, findDropTarget(boxes.current, x, y));
  };
  const restart = () => {
    Speech.stop(); const fresh = newRounds(); setRounds(fresh); setRound(0); setTargets(shuffle(fresh[0]));
    matchedRef.current = []; boxes.current = {}; setMatched([]); setSelected(null); setFinished(false);
    setMessage('Drag each animal to its matching picture below.');
  };
  return <ScrollView scrollEnabled={!dragging} onScrollBeginDrag={() => { boxes.current = {}; }} style={s.page} contentContainerStyle={s.content}>
    <View style={s.toolbar}><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Alphabet</Text></Pressable><Pressable accessibilityRole="switch" accessibilityLabel="Spoken instructions" accessibilityState={{ checked: !muted }} onPress={() => { Speech.stop(); setMuted(m => !m); }} style={s.button}><Text style={s.buttonText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text></Pressable></View>
    {saveError && <Text style={s.subtitle}>Rewards could not be saved yet. Try saving from My sticker book.</Text>}
    <Text style={s.title}>{finished ? 'Animal matching champion!' : 'Match the animals 🐾'}</Text>
    <Text style={s.subtitle}>{finished ? 'Nine matches! Wonderful exploring.' : `Animal adventure ${round + 1} of 3`}</Text>
    <Text style={s.stars}>{'⭐'.repeat(round * 3 + matched.length) || '☆ ☆ ☆'}</Text>
    {finished ? <>
      <Text style={s.celebration}>🎉 🐾 🎉</Text><Text style={s.message}>You helped all the animals find a friend!</Text>
      <View style={s.rewards}>{Array.from(new Map(rounds.flat().map(a => [a.letter, a])).values()).map(a => <Text key={a.letter} accessibilityLabel={`${a.word} sticker`} style={s.sticker}>{a.emoji}</Text>)}</View>
      <Pressable accessibilityRole="button" onPress={restart} style={s.primary}><Text style={s.primaryText}>Play again</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>Back to exploring</Text></Pressable>
    </> : <>
      <Pressable accessibilityRole="button" onPress={() => say('Drag each animal to the same picture below. Or tap an animal, then tap its matching picture.')} style={s.button}><Text style={s.buttonText}>🔊 Hear how to play</Text></Pressable>
      <Text style={s.subtitle}>Drag an animal down to its friend</Text>
      <View style={[s.board, { maxWidth: Math.min(width - 24, 750) }]}>
        <View style={[s.row, { zIndex: 10 }]}>{rounds[round].map(a => <Draggable key={`${round}-${a.letter}`} animal={a} disabled={matched.includes(a.letter)} selected={selected?.letter === a.letter} onDrop={drop} onSelect={animal => { setSelected(animal); say(`Find the other ${animal.word}.`); }} onDrag={active => { setDragging(active); if (active) measureTargets(); }} />)}</View>
        <Text pointerEvents="none" style={s.arrow}>↓     ↓     ↓</Text>
        <View style={s.row}>{targets.map(a => <View key={`${round}-${a.letter}`} ref={view => { targetRefs.current[a.letter] = view; }} collapsable={false} onLayout={measureTargets} style={s.targetWrap}><Pressable accessibilityRole="button" accessibilityLabel={`Matching ${a.word} picture`} accessibilityState={{ disabled: matched.includes(a.letter) }} disabled={matched.includes(a.letter)} onPress={() => { if (selected) match(selected, a.letter); else { setMessage('First tap or drag an animal from the top row.'); say('Choose an animal from the top row first.'); } }} style={[s.tile, s.target, matched.includes(a.letter) && s.matched, selected?.letter === a.letter && s.selected]}><Text style={[s.animal, !matched.includes(a.letter) && { opacity: 0.55 }]}>{a.emoji}</Text><Text style={s.name}>{matched.includes(a.letter) ? 'Matched! ⭐' : a.word}</Text></Pressable></View>)}</View>
      </View>
      <Text accessibilityLiveRegion="polite" style={s.message}>{message}</Text>
      <Text style={s.subtitle}>You can also tap an animal, then tap its friend.</Text>
    </>}
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFDF7' }, content: { padding: 12, paddingBottom: 35, alignItems: 'center' }, toolbar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: { padding: 13, minHeight: 48, borderRadius: 18, backgroundColor: '#EEE8FF', marginVertical: 6 }, buttonText: { fontSize: 16, fontWeight: '800', color: '#58369e' },
  title: { fontSize: 28, fontWeight: '900', color: '#292348', textAlign: 'center', marginTop: 18 }, subtitle: { fontSize: 16, color: '#6B647E', textAlign: 'center', marginVertical: 10 },
  stars: { fontSize: 26, textAlign: 'center', color: '#ab7a17', margin: 10 }, board: { width: '100%', overflow: 'visible', marginTop: 14 }, row: { flexDirection: 'row', gap: 10, overflow: 'visible' },
  tile: { minHeight: 125, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center', padding: 5 }, source: { flex: 1, borderColor: '#c2e2ef', backgroundColor: '#DFF4FF' }, targetWrap: { flex: 1 }, target: { borderStyle: 'dashed', borderColor: '#cbb8e9', backgroundColor: '#F3EEFA' },
  selected: { borderColor: '#7046B9', borderWidth: 4 }, done: { opacity: 0.5 }, matched: { borderColor: '#5b9d6c', backgroundColor: '#E6F8E7', borderStyle: 'solid' }, animal: { fontSize: 56 }, name: { fontSize: 14, fontWeight: '800', color: '#39334D', textAlign: 'center' },
  arrow: { textAlign: 'center', fontSize: 36, color: '#b7a1d6', paddingVertical: 25 }, message: { fontSize: 19, color: '#5e4980', fontWeight: '700', textAlign: 'center', marginVertical: 20 },
  celebration: { fontSize: 60, marginTop: 20 }, rewards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }, sticker: { fontSize: 55, backgroundColor: '#fff0c9', borderRadius: 22, padding: 12 },
  primary: { padding: 18, backgroundColor: '#6946BC', borderRadius: 24, marginVertical: 15 }, primaryText: { fontSize: 20, color: 'white', fontWeight: '800' },
});
