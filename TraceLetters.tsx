import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { advanceTrace } from './tracingLogic';
import { Point, animalTraces, letterTraces, sampledStrokes } from './traceCatalog';
import { useProgress } from './ProgressStore';
const colors = ['#D7F3FF', '#FFE0ED', '#D4F4E4', '#FFEDAD', '#E7D9FF', '#FFE2CC'];
const inks = ['#176A94', '#9C3868', '#23745B', '#84610F', '#6C3EA2', '#9B5426'];
export default function TraceLetters({ onExit, initialMode = 'letter' }: { onExit: () => void; initialMode?: 'letter' | 'animal' }) {
  const { width, height } = useWindowDimensions();
  const { progress, recordTracing, saveError } = useProgress();
  const size = Math.max(180, Math.min(width - 32, height * 0.54, 600));
  const scale = size / 300;
  const [mode, setMode] = useState(initialMode);
  const [index, setIndex] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [visited, setVisited] = useState(0);
  const [won, setWon] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [hint, setHint] = useState('Start at the purple dot and follow the colorful path.');
  const items = mode === 'letter' ? letterTraces : animalTraces;
  const item = items[index];
  const article = /^[aeiou]/i.test(item.name) ? "an" : "a";
  const strokes = useMemo(() => sampledStrokes(item), [item]);
  const current = strokes[stroke] ?? strokes[0];
  const visitedRef = useRef(0);
  const previous = useRef<Point | null>(null);
  const locked = useRef(false);
  const pendingStroke = useRef<number | null>(null);
  const guide = useRef(new Animated.Value(0)).current;
  const say = (text: string) => { Speech.stop(); if (!muted) Speech.speak(text, { language: 'en-US', rate: 0.78 }); };
  useEffect(() => {
    if (!muted && !finished) Speech.speak(`Let's trace ${item.name}. Start at the purple dot.`, { language: 'en-US', rate: 0.78 });
    return () => { Speech.stop(); };
  }, [item.id, muted, finished]);
  useEffect(() => {
    guide.setValue(0);
    if (won || finished) return;
    const loop = Animated.loop(Animated.timing(guide, { toValue: 1, duration: current.length * 65, useNativeDriver: true }));
    loop.start(); return () => loop.stop();
  }, [item.id, stroke, won, finished, revision, guide]);
  const reset = () => {
    previous.current = null; visitedRef.current = 0; locked.current = false; pendingStroke.current = null;
    setStroke(0); setVisited(0); setWon(false); setDrawing(false); setFinished(false); setRevision(r => r + 1);
    setHint('Start at the purple dot and follow the colorful path.');
  };
  const select = (next: number, nextMode = mode) => { Speech.stop(); setMode(nextMode); setIndex(next); reset(); };
  useEffect(() => {
    if (!won || finished) return;
    const timer = setTimeout(() => {
      if (index === items.length - 1) setFinished(true);
      else { setIndex(i => i + 1); reset(); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [won, finished, index, mode]);
  const touch = (event: GestureResponderEvent) => {
    if (locked.current || won) return;
    const point = { x: event.nativeEvent.locationX / scale, y: event.nativeEvent.locationY / scale };
    const next = advanceTrace(current, visitedRef.current, point, previous.current);
    previous.current = point;
    if (next === visitedRef.current) return;
    visitedRef.current = next; setVisited(next);
    if (next === current.length) {
      previous.current = null; locked.current = true;
      if (stroke === strokes.length - 1) {
        setWon(true); setDrawing(false); recordTracing(item.id, item.kind);
        setHint(`Wonderful! You traced ${item.name}! One saved star! ⭐`); say(`Wonderful! You traced ${item.name}!`);
      } else {
        pendingStroke.current = stroke + 1;
        setHint('Great! Lift your finger, then start at the next purple dot.');
        say('Great! Lift your finger and find the next purple dot.');
      }
    }
  };
  const release = () => {
    previous.current = null; setDrawing(false);
    if (pendingStroke.current !== null) {
      setStroke(pendingStroke.current); pendingStroke.current = null;
      locked.current = false; visitedRef.current = 0; setVisited(0);
    }
  };
  const guideRange = current.map((_, i) => i / (current.length - 1));
  const completed = item.kind === 'letter' ? progress.tracedLetters : progress.tracedAnimals;
  const percent = Math.round((strokes.slice(0, stroke).reduce((sum, points) => sum + points.length, 0) + visited) / strokes.reduce((sum, points) => sum + points.length, 0) * 100);
  return <ScrollView scrollEnabled={!drawing} style={s.page} contentContainerStyle={s.content}>
    <View style={s.toolbar}><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Alphabet</Text></Pressable><Pressable accessibilityRole="switch" accessibilityLabel="Spoken tracing instructions" accessibilityState={{ checked: !muted }} onPress={() => { Speech.stop(); setMuted(m => !m); }} style={s.button}><Text style={s.buttonText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text></Pressable></View>
    <Text style={s.title}>🌈 Trace and discover!</Text>
    <View style={s.tabs}>{(['letter', 'animal'] as const).map(tab => <Pressable key={tab} accessibilityRole="button" accessibilityState={{ selected: mode === tab }} onPress={() => select(0, tab)} style={[s.tab, { backgroundColor: tab === 'letter' ? '#D7F3FF' : '#FFE0ED' }, mode === tab && s.tabSelected]}><Text style={s.buttonText}>{tab === 'letter' ? '🔤 Letters A–Z' : '🐾 Animals'}</Text></Pressable>)}</View>
    {finished ? <>
      <Text style={s.bigStars}>⭐ 🎉 ⭐</Text><Text style={s.message}>Lovely tracing! Explore more or take a little break.</Text>
      <Text style={s.subtitle}>{completed.length} of {items.length} {mode === 'letter' ? 'letters' : 'animals'} traced and saved</Text>
      <Pressable accessibilityRole="button" onPress={() => select(0)} style={s.primary}><Text style={s.primaryText}>Explore again</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => select(0, mode === 'letter' ? 'animal' : 'letter')} style={s.button}><Text style={s.buttonText}>{mode === 'letter' ? 'Try animal tracing 🐾' : 'Try letter tracing 🔤'}</Text></Pressable>
    </> : <>
      <Text style={[s.itemTitle, { color: inks[index % inks.length] }]}>{mode === 'letter' ? `Let's trace ${item.name}` : `${item.icon} Let's draw ${article} ${item.name.toLowerCase()}!`}</Text>
      <Text style={s.subtitle}>{index + 1} / {items.length} · Stroke {stroke + 1} of {strokes.length}{completed.includes(item.id) ? ' · Traced before ✓' : ''}</Text>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }} accessibilityLabel="Tracing progress" style={s.progress}><View style={{ width: `${percent}%`, height: 10, borderRadius: 6, backgroundColor: '#27A783' }} /></View>
      <Pressable accessibilityRole="button" onPress={() => say(`Trace ${item.name}. Start at the purple dot, and follow the path with your finger.`)} style={s.button}><Text style={s.buttonText}>🔊 Hear how to trace</Text></Pressable>
      <View accessibilityLabel={`Tracing canvas for ${item.name}. Follow the purple starting dot.`} style={[s.board, { width: size, height: size, backgroundColor: colors[index % colors.length] }]} onStartShouldSetResponder={() => !won} onMoveShouldSetResponder={() => !won} onResponderGrant={e => { setDrawing(true); previous.current = null; touch(e); }} onResponderMove={touch} onResponderRelease={release} onResponderTerminate={release} onResponderTerminationRequest={() => false}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {strokes.map((points, si) => points.map((p, pi) => <View key={`${si}-${pi}`} style={[s.dot, { left: p.x * scale - 10 * scale, top: p.y * scale - 10 * scale, width: 20 * scale, height: 20 * scale, borderRadius: 10 * scale, backgroundColor: si < stroke || (si === stroke && pi < visited) ? '#27A783' : si === stroke ? '#FFFFFF' : '#B5A6C5', opacity: si <= stroke ? 1 : 0.65 }]} />))}
          {item.features?.map((p, i) => <View key={i} style={{ position: 'absolute', left: p.x * scale - 4 * scale, top: p.y * scale - 4 * scale, width: 8 * scale, height: 8 * scale, borderRadius: 4 * scale, backgroundColor: '#493656' }} />)}
          {!won && <><View style={[s.start, { left: current[0].x * scale - 17 * scale, top: current[0].y * scale - 17 * scale, width: 34 * scale, height: 34 * scale, borderRadius: 17 * scale }]} /><Text style={[s.startLabel, { left: Math.max(4, Math.min(size - 75, current[0].x * scale - 30)), top: Math.max(4, current[0].y * scale - 45 * scale) }]}>Start {stroke + 1}</Text>
            <Animated.View style={[s.guide, { width: 18 * scale, height: 18 * scale, borderRadius: 9 * scale, transform: [{ translateX: guide.interpolate({ inputRange: guideRange, outputRange: current.map(p => p.x * scale - 9 * scale) }) }, { translateY: guide.interpolate({ inputRange: guideRange, outputRange: current.map(p => p.y * scale - 9 * scale) }) }] }]} />
          </>}{won && <Text style={s.success}>⭐</Text>}
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={s.message}>{hint}</Text>
      {!won && <Pressable accessibilityRole="button" onPress={reset} style={s.button}><Text style={s.buttonText}>↻ Try this tracing again</Text></Pressable>}
      <Text style={s.subtitle}>{won ? 'Your next tracing is coming…' : 'Follow the path. Lift your finger whenever you need to.'}</Text>
    </>}
    <Text style={s.section}>🎨 Choose any {mode === 'letter' ? 'letter' : 'animal'}</Text>
    <View style={s.grid}>{items.map((entry, i) => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Trace ${entry.name}`} accessibilityState={{ selected: index === i }} onPress={() => select(i)} style={[s.card, { backgroundColor: colors[i % colors.length], borderColor: i === index ? inks[i % inks.length] : 'transparent', width: mode === 'letter' ? width >= 600 ? '11%' : '18%' : '43%' }]}><Text style={[s.cardLabel, { color: inks[i % inks.length] }]}>{entry.icon}</Text>{mode === 'animal' && <Text style={s.buttonText}>{entry.name}</Text>}{completed.includes(entry.id) && <Text style={s.check}>✓</Text>}</Pressable>)}</View>
    <Text style={s.subtitle}>{saveError ? 'Your latest reward could not be saved. Try saving again from My sticker book.' : `Saved: ${progress.tracedLetters.length}/26 letters · ${progress.tracedAnimals.length}/{animalTraces.length} animal outlines`}</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0FBFF' }, content: { padding: 12, alignItems: 'center', paddingBottom: 30 }, toolbar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: { padding: 13, minHeight: 48, borderRadius: 18, backgroundColor: '#EEE8FF', marginVertical: 6 }, buttonText: { fontSize: 16, fontWeight: '800', color: '#58369e', textAlign: 'center' }, title: { color: '#57388E', fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 16 }, itemTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 15 }, subtitle: { color: '#6B647E', textAlign: 'center', fontSize: 15, marginVertical: 10 },
  tabs: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }, tab: { padding: 14, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' }, tabSelected: { borderColor: '#7751C5' }, progress: { height: 10, width: '85%', maxWidth: 600, backgroundColor: '#DFD6EB', borderRadius: 6, overflow: 'hidden' },
  board: { borderRadius: 26, borderWidth: 2, borderColor: '#BAA3DE', overflow: 'hidden', marginVertical: 10 }, dot: { position: 'absolute' }, start: { position: 'absolute', borderWidth: 4, borderColor: '#7751C5', backgroundColor: '#C4ADE7' }, startLabel: { position: 'absolute', color: '#684399', fontWeight: '900', fontSize: 15 }, guide: { position: 'absolute', backgroundColor: '#F5B93D', borderWidth: 2, borderColor: '#fff' },
  message: { color: '#5E4980', fontWeight: '800', fontSize: 19, textAlign: 'center', marginVertical: 14 }, success: { position: 'absolute', bottom: 12, right: 15, fontSize: 45 }, bigStars: { fontSize: 55, marginTop: 35 }, primary: { padding: 18, backgroundColor: '#6946BC', borderRadius: 24, marginVertical: 15 }, primaryText: { fontSize: 20, color: 'white', fontWeight: '800' }, section: { fontSize: 22, fontWeight: '900', color: '#57388E', textAlign: 'center', marginVertical: 15 }, grid: { width: '100%', maxWidth: 800, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }, card: { minHeight: 65, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', padding: 7 }, cardLabel: { fontSize: 30, fontWeight: '900' }, check: { color: '#176C50', fontWeight: '900', fontSize: 18 },
});
