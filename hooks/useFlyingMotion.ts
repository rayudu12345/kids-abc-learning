import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
/** Pause at the current position; resume from there rather than jumping back to the start. */
export default function useFlyingMotion(active: boolean, duration: number, phase: number) {
  const progress = useRef(new Animated.Value(phase)).current;
  useEffect(() => {
    let live = true;
    let animation: Animated.CompositeAnimation | undefined;
    const fly = (from: number) => {
      if (!live) return;
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: duration * Math.max(0.02, 1 - from),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => {
        if (live && finished) {
          progress.setValue(0);
          fly(0);
        }
      });
    };
    if (active) progress.stopAnimation((value) => fly(value));
    else progress.stopAnimation();
    return () => {
      live = false;
      animation?.stop();
    };
  }, [active, duration, progress]);
  return progress;
}
