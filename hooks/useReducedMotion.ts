import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
/** Begin still while reading the device preference; ignore stale reads after a change. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let live = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      changed = true;
      if (live) setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (live && !changed) setReduced(value);
      },
      () => {
        // Keep still play if the preference cannot be read.
      },
    );
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
