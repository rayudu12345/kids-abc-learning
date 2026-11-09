import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import * as Speech from "expo-speech";
import { alphabet } from "../LetterScene";
export default function useAlphabetPlayback() {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [sceneVersion, setSceneVersion] = useState(0);
  const cardBounce = useRef(new Animated.Value(1)).current;
  const heroScale = useRef(new Animated.Value(0.4)).current;
  const activeItem = alphabet.find(([letter]) => letter === activeLetter);
  useEffect(
    () => () => {
      Speech.stop();
      cardBounce.stopAnimation();
      heroScale.stopAnimation();
    },
    [cardBounce, heroScale],
  );
  const playLetter = (letter: string, word: string) => {
    setActiveLetter(letter);
    setSceneVersion((version) => version + 1);
    heroScale.setValue(0.4);
    Animated.spring(heroScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 11,
      bounciness: 14,
    }).start();
    cardBounce.setValue(1);
    Animated.sequence([
      Animated.spring(cardBounce, {
        toValue: 1.18,
        useNativeDriver: true,
        speed: 18,
        bounciness: 12,
      }),
      Animated.spring(cardBounce, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
    ]).start();
    Speech.stop();
    const sound = letter === "C" ? " Meow!" : letter === "L" ? " A soft roar!" : "";
    Speech.speak(`${letter}! ${letter} is for ${word}!${sound}`, {
      language: "en-US",
      rate: 0.78,
      pitch: 1.08,
    });
  };
  return { activeLetter, activeItem, sceneVersion, cardBounce, heroScale, playLetter };
}
