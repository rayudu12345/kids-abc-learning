import React, { useEffect, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { Point, advanceTrace, strokePoints, tracingLetters } from './tracingLogic';
export default function TraceLetters({ onExit }: { onExit: () => void }) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width - 32, height * 0.53, 600);
  const scale = size / 300;
  const [index, setIndex] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [visited, setVisited] = useState(0);
  const [won, setWon] = useState(false);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hint, setHint] = useState('Start at the purple dot and follow the dotted path.');
  const letter = tracingLetters[index];
  const strokes = strokePoints(letter);
  const current = strokes[stroke];
  const visitedRef = useRef(0);
  const previous = useRef<Point | null>(null);
  const locked = useRef(false);
  const guide = useRef(new Animated.Value(0)).current;
  const say = (text: string) => { Speech.stop(); if (!muted) Speech.speak(text, { language: 'en-US', rate: 0.78 }); };
  useEffect(() => {
    if (!muted && !finished) Speech.speak(`Let's trace ${letter}. Start at the purple dot.`, { language: 'en-US', rate: 0.78 });
    return () => { Speech.stop(); };
  }, [letter, muted, finished]);
  useEffect(() => {
    guide.setValue(0);
    if (won || finished) return;
    const loop = Animated.loop(Animated.timing(guide, { toValue: 1, duration: current.length * 65, useNativeDriver: true }));
    loop.start(); return () => loop.stop();
  }, [letter, stroke, won, finished, guide]);
  const reset = () => {
    previous.current = null; visitedRef.current = 0; locked.current = false;
    setStroke(0); setVisited(0); setWon(false); setDrawing(false);
    setHint('Start at the purple dot and follow the dotted path.');
  };
  useEffect(() => {
    if (!won || finished) return;
    const timer = setTimeout(() => {
      if (index === tracingLetters.length - 1) setFinished(true);
      else { setIndex(i => i + 1); reset(); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [won, finished, index]);
  const touch = (event: GestureResponderEvent) => {
    if (locked.current || won) return;
    const point = { x: event.nativeEvent.locationX / scale, y: event.nativeEvent.locationY / scale };
    const next = advanceTrace(current, visitedRef.current, point, previous.current);
    previous.current = point;
    if (next === visitedRef.current) return;
    visitedRef.current = next; setVisited(next);
    if (next === current.length) {
      previous.current = null;
      if (stroke === strokes.length - 1) {
        locked.current = true; setWon(true); setDrawing(false);
        setHint(`Wonderful! You traced ${letter}! ⭐`); say(`Wonderful! You traced ${letter}!`);
      } else {
        // Wait for a fresh touch before starting the next stroke.
        locked.current = true;
        setHint('Great! Lift your finger, then start at the next purple dot.');
        say('Great! Lift your finger and find the next purple dot.');
      }
    }
  };
  const release = () => {
    previous.current = null; setDrawing(false);
    if (locked.current && !won && visitedRef.current === current.length && stroke < strokes.length - 1) {
      locked.current = false; visitedRef.current = 0; setVisited(0); setStroke(s => s + 1);
    }
  };
  const guideRange = current.map((_, i) => i / (current.length - 1));
  return <ScrollView scrollEnabled={!drawing} style={s.page} contentContainerStyle={s.content}>
    <View style={s.toolbar}><Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>‹ Alphabet</Text></Pressable><Pressable accessibilityRole="switch" accessibilityLabel="Spoken tracing instructions" accessibilityState={{ checked: !muted }} onPress={() => { Speech.stop(); setMuted(m => !m); }} style={s.button}><Text style={s.buttonText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text></Pressable></View>
    <Text style={s.title}>{finished ? 'Lovely letter tracing! 🎉' : `Let's trace ${letter}`}</Text>
    {finished ? <>
      <Text style={s.bigStars}>⭐ ⭐ ⭐</Text><Text style={s.message}>You traced L, T, and I. Wonderful exploring!</Text>
      <Pressable accessibilityRole="button" onPress={() => { setIndex(0); setFinished(false); reset(); }} style={s.primary}><Text style={s.primaryText}>Trace again</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={onExit} style={s.button}><Text style={s.buttonText}>Back to exploring</Text></Pressable>
    </> : <>
      <Text style={s.subtitle}>Letter {index + 1} of 3 · Stroke {stroke + 1} of {strokes.length}</Text>
      <Pressable accessibilityRole="button" onPress={() => say(`Trace ${letter}. Start at the purple dot, and follow the path with your finger.`)} style={s.button}><Text style={s.buttonText}>🔊 Hear how to trace</Text></Pressable>
      <View accessibilityLabel={`Tracing canvas for ${letter}. Follow the purple starting dot.`} style={[s.board, { width: size, height: size }]} onStartShouldSetResponder={() => !won} onMoveShouldSetResponder={() => !won} onResponderGrant={e => { setDrawing(true); previous.current = null; touch(e); }} onResponderMove={touch} onResponderRelease={release} onResponderTerminate={release} onResponderTerminationRequest={() => false}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {strokes.map((points, si) => points.map((p, pi) => <View key={`${si}-${pi}`} style={[s.dot, { left: p.x * scale - 12 * scale, top: p.y * scale - 12 * scale, width: 24 * scale, height: 24 * scale, borderRadius: 12 * scale, backgroundColor: si < stroke || (si === stroke && pi < visited) ? '#66B88A' : '#D9CAE9' }]} />))}
          {!won && <><View style={[s.start, { left: current[0].x * scale - 18 * scale, top: current[0].y * scale - 18 * scale, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale }]} /><Text style={[s.startLabel, { left: Math.max(4, current[0].x * scale - 30), top: current[0].y * scale - 48 * scale }]}>Start {stroke + 1}</Text>
            <Animated.View style={[s.guide, { width: 20 * scale, height: 20 * scale, borderRadius: 10 * scale, transform: [{ translateX: guide.interpolate({ inputRange: guideRange, outputRange: current.map(p => p.x * scale - 10 * scale) }) }, { translateY: guide.interpolate({ inputRange: guideRange, outputRange: current.map(p => p.y * scale - 10 * scale) }) }] }]} />
          </>}
          {won && <Text style={s.success}>⭐</Text>}
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={s.message}>{hint}</Text>
      {!won && <Pressable accessibilityRole="button" onPress={reset} style={s.button}><Text style={s.buttonText}>↻ Try this letter again</Text></Pressable>}
      <Text style={s.subtitle}>{won ? 'Your next step is coming…' : 'Take your time. Lift your finger whenever you need to.'}</Text>
    </>}
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFDF7' }, content: { padding: 12, alignItems: 'center', paddingBottom: 30 }, toolbar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: { padding: 13, minHeight: 48, borderRadius: 18, backgroundColor: '#EEE8FF', marginVertical: 6 }, buttonText: { fontSize: 16, fontWeight: '800', color: '#58369e' }, title: { color: '#292348', fontSize: 29, fontWeight: '900', textAlign: 'center', marginTop: 16 }, subtitle: { color: '#6B647E', textAlign: 'center', fontSize: 15, marginVertical: 10 },
  board: { backgroundColor: '#F7F2FF', borderRadius: 26, borderWidth: 2, borderColor: '#D9CCFF', overflow: 'hidden', marginVertical: 10 }, dot: { position: 'absolute' }, start: { position: 'absolute', borderWidth: 4, borderColor: '#7751C5', backgroundColor: '#C4ADE7' }, startLabel: { position: 'absolute', color: '#684399', fontWeight: '900', fontSize: 15 }, guide: { position: 'absolute', backgroundColor: '#F5B93D', borderWidth: 2, borderColor: '#fff', opacity: 0.85 },
  message: { color: '#5E4980', fontWeight: '800', fontSize: 19, textAlign: 'center', marginVertical: 14 }, success: { position: 'absolute', bottom: 12, right: 15, fontSize: 45 }, bigStars: { fontSize: 55, marginTop: 35 }, primary: { padding: 18, backgroundColor: '#6946BC', borderRadius: 24, marginVertical: 15 }, primaryText: { fontSize: 20, color: 'white', fontWeight: '800' },
});
